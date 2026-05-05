import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

// fill this with your actual GitHub info, for example:
export const gitConfig = {
  user: 'jamiechalmerzlp',
  repo: 'nexa-dash',
  branch: 'main',
};

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className="flex items-center gap-4">
          <Image
            src="/img/logo512.png"
            alt="NexaDash Logo"
            width={20}
            height={20}
          />
          <span>NexaDash</span>
        </div>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
