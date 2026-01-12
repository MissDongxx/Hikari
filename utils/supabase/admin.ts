import { toDateTime } from '@/utils/helpers';
import { stripe } from '@/utils/stripe/config';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import type { Database, Tables, TablesInsert } from '@/types/db';
import { env } from '@/env';

type Product = Tables<'products'>;
type Price = Tables<'prices'>;

// Trial period length in days (can be configured via environment variable)
const TRIAL_PERIOD_DAYS = Number(process.env.TRIAL_PERIOD_DAYS) || 0;

// Use service_role key for admin operations (bypasses RLS, has full access)
// DO NOT expose this key to the client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  env.SUPABASE_SERVICE_ROLE_KEY
);

const upsertProductRecord = async (product: Stripe.Product) => {
  const productData: Product = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? null,
    image: product.images?.[0] ?? null,
    metadata: product.metadata
  };

  const { error: upsertError } = await supabase
    .from('products')
    .upsert([productData]);
  if (upsertError) {
    console.error(`Product insert/update failed: ${upsertError.message}`);
    throw new Error(`Product insert/update failed: ${upsertError.message}`);
  }
};

const upsertPriceRecord = async (
  price: Stripe.Price
) => {
  const priceData: Price = {
    id: price.id,
    product_id: typeof price.product === 'string' ? price.product : '',
    active: price.active,
    currency: price.currency,
    type: price.type,
    unit_amount: price.unit_amount ?? null,
    interval: price.recurring?.interval ?? null,
    interval_count: price.recurring?.interval_count ?? null,
    trial_period_days: price.recurring?.trial_period_days ?? TRIAL_PERIOD_DAYS,
    description: null,
    metadata: null
  };

  // Retry logic for transient errors (network issues, timeouts)
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const { error: upsertError } = await supabase
      .from('prices')
      .upsert([priceData]);

    // Don't retry on foreign key constraint errors (permanent failure)
    if (upsertError?.message.includes('foreign key constraint')) {
      console.error(
        `Price insert/update failed due to foreign key constraint: ${upsertError.message}`
      );
      throw new Error(
        `Price insert/update failed: Product ${priceData.product_id} does not exist`
      );
    }

    // If no error or last attempt, break
    if (!upsertError || attempt === maxRetries) {
      if (upsertError) {
        console.error(
          `Price insert/update failed after ${maxRetries} retries: ${upsertError.message}`
        );
        throw new Error(
          `Price insert/update failed after ${maxRetries} retries: ${upsertError.message}`
        );
      }
      break;
    }

    // Exponential backoff for transient errors
    const delay = baseDelay * Math.pow(2, attempt);
    console.warn(
      `Price upsert attempt ${attempt + 1} failed, retrying in ${delay}ms...`
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
};

const deleteProductRecord = async (product: Stripe.Product) => {
  const { error: deletionError } = await supabase
    .from('products')
    .delete()
    .eq('id', product.id);
  if (deletionError) {
    console.error(`Product deletion failed: ${deletionError.message}`);
    throw new Error(`Product deletion failed: ${deletionError.message}`);
  }
};

const deletePriceRecord = async (price: Stripe.Price) => {
  const { error: deletionError } = await supabase
    .from('prices')
    .delete()
    .eq('id', price.id);
  if (deletionError) {
    console.error(`Price deletion failed: ${deletionError.message}`);
    throw new Error(`Price deletion failed: ${deletionError.message}`);
  }
};

const upsertCustomerToSupabase = async (uuid: string, customerId: string) => {
  const { error: upsertError } = await supabase
    .from('customers')
    .upsert([{ id: uuid, stripe_customer_id: customerId }]);

  if (upsertError) {
    console.error(
      `Supabase customer record creation failed: ${upsertError.message}`
    );
    throw new Error(
      `Supabase customer record creation failed: ${upsertError.message}`
    );
  }

  return customerId;
};

const createCustomerInStripe = async (uuid: string, email: string) => {
  const customerData = { metadata: { supabaseUUID: uuid }, email: email };
  const newCustomer = await stripe.customers.create(customerData);
  if (!newCustomer) {
    console.error('Stripe customer creation failed.');
    throw new Error('Stripe customer creation failed.');
  }

  return newCustomer.id;
};

const createOrRetrieveCustomer = async ({
  email,
  uuid
}: {
  email: string;
  uuid: string;
}) => {

  // Check if the customer already exists in Supabase
  const { data: existingSupabaseCustomer, error: queryError } =
    await supabase
      .from('customers')
      .select('*')
      .eq('id', uuid)
      .maybeSingle();

  if (queryError) {
    console.error(`Supabase customer lookup failed: ${queryError.message}`);
    throw new Error(`Supabase customer lookup failed: ${queryError.message}`);
  }

  // Retrieve the Stripe customer ID using the Supabase customer ID, with email fallback
  let stripeCustomerId: string | undefined;
  if (existingSupabaseCustomer?.stripe_customer_id) {
    const existingStripeCustomer = await stripe.customers.retrieve(
      existingSupabaseCustomer.stripe_customer_id
    );
    stripeCustomerId = existingStripeCustomer.id;
  } else {
    // If Stripe ID is missing from Supabase, try to retrieve Stripe customer ID by email
    const stripeCustomers = await stripe.customers.list({ email: email });
    stripeCustomerId =
      stripeCustomers.data.length > 0 ? stripeCustomers.data[0].id : undefined;
  }

  // If still no stripeCustomerId, create a new customer in Stripe
  const stripeIdToInsert = stripeCustomerId
    ? stripeCustomerId
    : await createCustomerInStripe(uuid, email);
  if (!stripeIdToInsert) throw new Error('Stripe customer creation failed.');

  if (existingSupabaseCustomer && stripeCustomerId) {
    // If Supabase has a record but doesn't match Stripe, update Supabase record
    if (existingSupabaseCustomer.stripe_customer_id !== stripeCustomerId) {
      console.warn(
        'Supabase customer record mismatched Stripe ID. Updating Supabase record.'
      );
      const { error: updateError } = await supabase
        .from('customers')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', uuid);

      if (updateError) {
        console.error(
          `Supabase customer record update failed: ${updateError.message}`
        );
        throw new Error(
          `Supabase customer record update failed: ${updateError.message}`
        );
      }
    }
    // If Supabase has a record and matches Stripe, return Stripe customer ID
    return stripeCustomerId;
  } else {
    console.warn(
      'Supabase customer record was missing. Creating a new record.'
    );

    // If Supabase has no record, create a new record and return Stripe customer ID
    const upsertedStripeCustomer = await upsertCustomerToSupabase(
      uuid,
      stripeIdToInsert
    );
    if (!upsertedStripeCustomer)
      throw new Error('Supabase customer record creation failed.');

    return upsertedStripeCustomer;
  }
};

/**
 * Copies the billing details from the payment method to the customer object.
 */
const copyBillingDetailsToCustomer = async (
  uuid: string,
  payment_method: Stripe.PaymentMethod
) => {
  // Check if customer exists and is a string (customer ID)
  if (!payment_method.customer || typeof payment_method.customer !== 'string') {
    console.error('Invalid customer attached to payment method');
    return;
  }

  const customer = payment_method.customer;
  const { name, phone, address } = payment_method.billing_details;
  if (!name || !phone || !address) return;

  // Convert null values to undefined for Stripe API compatibility
  const addressParam = {
    line1: address.line1 ?? undefined,
    line2: address.line2 ?? undefined,
    city: address.city ?? undefined,
    state: address.state ?? undefined,
    postal_code: address.postal_code ?? undefined,
    country: address.country ?? undefined
  };

  await stripe.customers.update(customer, { name, phone, address: addressParam });
  const { error: updateError } = await supabase
    .from('users')
    .update({
      billing_address: { ...address },
      payment_method: { ...payment_method[payment_method.type] }
    })
    .eq('id', uuid);
  if (updateError) {
    console.error(`Customer update failed: ${updateError.message}`);
    throw new Error(`Customer update failed: ${updateError.message}`);
  }
};

const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  createAction = false
) => {
  // Get customer's UUID from mapping table.
  const { data: customerData, error: noCustomerError } = await supabase
    .from('customers')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (noCustomerError) {
    console.error(`Customer lookup failed: ${noCustomerError.message}`);
    throw new Error(`Customer lookup failed: ${noCustomerError.message}`);
  }

  const { id: uuid } = customerData!;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method']
  });

  // Extract subscription data from the response
  // Note: Response<Subscription> has different type than Subscription
  const sub = subscription as unknown as Stripe.Subscription;

  // WARNING: Current database schema only supports one price per subscription.
  // If subscription has multiple items, only the first one will be stored.
  if (sub.items.data.length > 1) {
    console.warn(
      `Subscription ${subscriptionId} has ${sub.items.data.length} items, ` +
      `but current schema only supports one. Storing only the first item.`
    );
  }
  const subscriptionItem = sub.items.data[0];

  // Idempotency check: Use subscription's current_period_end as a version timestamp
  // This prevents race conditions when multiple webhooks arrive simultaneously
  const subscriptionTimestamp = sub.current_period_end;

  // Check if we already have a newer version of this subscription
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('current_period_end')
    .eq('id', subscriptionId)
    .maybeSingle();

  if (existingSub) {
    const existingTimestamp = new Date(existingSub.current_period_end).getTime();
    // If the existing subscription is newer or equal, skip this update
    if (existingTimestamp >= subscriptionTimestamp * 1000) {
      console.info(
        `Skipping subscription ${subscriptionId} update: ` +
        `existing version (${new Date(existingTimestamp).toISOString()}) is ` +
        `newer or equal to incoming (${new Date(subscriptionTimestamp * 1000).toISOString()})`
      );
      return;
    }
  }

  // Upsert the latest status of the subscription object.
  const subscriptionData: TablesInsert<'subscriptions'> = {
    id: sub.id,
    user_id: uuid,
    metadata: sub.metadata,
    status: sub.status,
    price_id: subscriptionItem.price.id,
    quantity: subscriptionItem.quantity ?? null,
    cancel_at_period_end: sub.cancel_at_period_end,
    cancel_at: sub.cancel_at
      ? toDateTime(sub.cancel_at).toISOString()
      : null,
    canceled_at: sub.canceled_at
      ? toDateTime(sub.canceled_at).toISOString()
      : null,
    current_period_start: toDateTime(
      sub.current_period_start
    ).toISOString(),
    current_period_end: toDateTime(
      sub.current_period_end
    ).toISOString(),
    created: toDateTime(sub.created).toISOString(),
    ended_at: sub.ended_at
      ? toDateTime(sub.ended_at).toISOString()
      : null,
    trial_start: sub.trial_start
      ? toDateTime(sub.trial_start).toISOString()
      : null,
    trial_end: sub.trial_end
      ? toDateTime(sub.trial_end).toISOString()
      : null
  };

  const { error: upsertError } = await supabase
    .from('subscriptions')
    .upsert([subscriptionData]);
  if (upsertError) {
    console.error(`Subscription insert/update failed: ${upsertError.message}`);
    throw new Error(
      `Subscription insert/update failed: ${upsertError.message}`
    );
  } 

  // For a new subscription copy the billing details to the customer object.
  // NOTE: This is a costly operation and should happen at the very end.
  if (createAction && subscription.default_payment_method && uuid) {
    // default_payment_method can be a string (ID) or expanded PaymentMethod object
    const paymentMethod = subscription.default_payment_method;
    if (typeof paymentMethod !== 'string') {
      await copyBillingDetailsToCustomer(
        uuid,
        paymentMethod
      );
    }
  }
};

export {
  upsertProductRecord,
  upsertPriceRecord,
  deleteProductRecord,
  deletePriceRecord,
  createOrRetrieveCustomer,
  manageSubscriptionStatusChange
};
