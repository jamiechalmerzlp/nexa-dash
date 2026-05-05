import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <HomeLayout
      {...baseOptions()}
      links={[
        { url: '/docs', text: 'Documentation' },
        {
          url: 'https://github.com/jamiechalmerzlp/nexa-dash',
          text: 'GitHub',
        },
        {
          url: 'https://hub.docker.com/r/jamiechalmerzlp/nexadash',
          text: 'Docker Hub',
        },
        { url: '/docs/installation/docker', text: 'Install' },
      ]}
    >
      {children}
    </HomeLayout>
  );
}
