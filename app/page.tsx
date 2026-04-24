import { redirect } from 'next/navigation';

/** Entry point — redirect to child home screen */
export default function RootPage() {
  redirect('/home');
}
