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
        <g className="icon-h-lane1" style={{ animationDelay: '10s' }}>
          <InstagramIcon />
        </g>
        <g className="icon-h-lane1" style={{ animationDelay: '20s' }}>
          <TwitterIcon />
        </g>

        <g className="icon-h-lane2" style={{ animationDelay: '5s' }}>
          <YoutubeIcon />
        </g>
        <g className="icon-h-lane2" style={{ animationDelay: '15s' }}>
          <LinkedInIcon />
        </g>
        <g className="icon-h-lane2" style={{ animationDelay: '25s' }}>
          <WhatsAppIcon />
        </g>
      </>
    );
  }

  if (right) {
    return (
      <>
        <g className="icon-lane1-right" style={{ animationDelay: '0s' }}>
          <LinkedInIcon />
        </g>
        <g className="icon-lane1-right" style={{ animationDelay: '10s' }}>
          <WhatsAppIcon />
        </g>
        <g className="icon-lane1-right" style={{ animationDelay: '20s' }}>
          <FacebookIcon />
        </g>

        <g className="icon-lane2-right" style={{ animationDelay: '5s' }}>
          <YoutubeIcon />
        </g>
        <g className="icon-lane2-right" style={{ animationDelay: '15s' }}>
          <InstagramIcon />
        </g>
        <g className="icon-lane2-right" style={{ animationDelay: '25s' }}>
          <TwitterIcon />
        </g>
      </>
    );
  }

  return (
    <>
      <g className="icon-lane1" style={{ animationDelay: '0s' }}>
        <FacebookIcon />
      </g>
      <g className="icon-lane1" style={{ animationDelay: '10s' }}>
        <TwitterIcon />
      </g>
      <g className="icon-lane1" style={{ animationDelay: '20s' }}>
        <LinkedInIcon />
      </g>

      <g className="icon-lane2" style={{ animationDelay: '5s' }}>
        <InstagramIcon />
      </g>
      <g className="icon-lane2" style={{ animationDelay: '15s' }}>
        <YoutubeIcon />
      </g>
      <g className="icon-lane2" style={{ animationDelay: '25s' }}>
        <WhatsAppIcon />
      </g>
    </>
  );
}
