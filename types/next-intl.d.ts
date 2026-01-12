import { Messages } from '../../next-intl.d.ts';

declare module 'next-intl' {
  interface RequestConfig extends Omit<import('next-intl').RequestConfig, 'messages'> {
    messages: Messages;
  }
}
