// TODO: Fix this when we turn strict mode on.
import { freePlan, proPlan } from '@/config/subscriptions';
import { createClient } from '@/utils/supabase/server';
import { UserSubscriptionPlan } from '../types';
import type { Database } from '@/types/db';

export async function getUserSubscriptionPlan(
  userId: string
): Promise<UserSubscriptionPlan> {
  const supabase = createClient();

  // Fetch user data with subscription information
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (userError || !userData) {
    throw new Error('User not found');
  }

  // Fetch subscription data
  const { data: subscriptionData } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Fetch customer data
  const { data: customerData } = await supabase
    .from('customers')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  // Check if user is on a pro plan
  const isPro =
    subscriptionData?.status === 'active' ||
    subscriptionData?.status === 'trialing';

  const plan = isPro ? proPlan : freePlan;

  return {
    ...plan,
    stripe_customer_id: customerData?.stripe_customer_id || '',
    stripe_subscription_id: subscriptionData?.id || '',
    stripe_price_id: subscriptionData?.price_id || '',
    stripe_current_period_end: subscriptionData?.current_period_end
      ? new Date(subscriptionData.current_period_end).getTime()
      : 0,
    isPro
  };
}
