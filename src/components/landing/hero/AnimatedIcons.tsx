import React from 'react';
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  LinkedInIcon,
  WhatsAppIcon,
  YoutubeIcon
} from './SocialIcons';

export default function AnimatedIcons({ right = false, horizontal = false }: { right?: boolean; horizontal?: boolean }) {
  if (horizontal) {
    return (
      <>
        <g className="icon-h-lane1" style={{ animationDelay: '0s' }}>
          <FacebookIcon />
        </g>
        <g className="icon-h-lane1" style={{ animationDelay: '6.66s' }}>
          <InstagramIcon />
        </g>
        <g className="icon-h-lane1" style={{ animationDelay: '13.33s' }}>
          <TwitterIcon />
        </g>

        <g className="icon-h-lane2" style={{ animationDelay: '3.33s' }}>
          <LinkedInIcon />
        </g>
        <g className="icon-h-lane2" style={{ animationDelay: '10s' }}>
          <WhatsAppIcon />
        </g>
        <g className="icon-h-lane2" style={{ animationDelay: '16.66s' }}>
          <YoutubeIcon />
        </g>
      </>
    );
  }

  if (right) {
    return (
      <>
        <g className="icon-lane1-right" style={{ animationDelay: '1.5s' }}>
          <YoutubeIcon />
        </g>
        <g className="icon-lane1-right" style={{ animationDelay: '8.16s' }}>
          <LinkedInIcon />
        </g>
        <g className="icon-lane1-right" style={{ animationDelay: '14.83s' }}>
          <WhatsAppIcon />
        </g>

        <g className="icon-lane2-right" style={{ animationDelay: '4.83s' }}>
          <TwitterIcon />
        </g>
        <g className="icon-lane2-right" style={{ animationDelay: '11.5s' }}>
          <FacebookIcon />
        </g>
        <g className="icon-lane2-right" style={{ animationDelay: '18.16s' }}>
          <InstagramIcon />
        </g>
      </>
    );
  }

  return (
    <>
      <g className="icon-lane1" style={{ animationDelay: '0s' }}>
        <FacebookIcon />
      </g>
      <g className="icon-lane1" style={{ animationDelay: '6.66s' }}>
        <InstagramIcon />
      </g>
      <g className="icon-lane1" style={{ animationDelay: '13.33s' }}>
        <TwitterIcon />
      </g>

      <g className="icon-lane2" style={{ animationDelay: '3.33s' }}>
        <LinkedInIcon />
      </g>
      <g className="icon-lane2" style={{ animationDelay: '10s' }}>
        <WhatsAppIcon />
      </g>
      <g className="icon-lane2" style={{ animationDelay: '16.66s' }}>
        <YoutubeIcon />
      </g>
    </>
  );
}
