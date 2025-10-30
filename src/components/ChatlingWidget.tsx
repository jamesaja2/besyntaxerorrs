import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const CHATBOT_ID = '2655476963';
const SCRIPT_ID = 'chtl-script';

declare global {
  interface Window {
    chtlConfig?: { chatbotId: string };
    requestIdleCallback?: (callback: IdleRequestCallback) => number;
    cancelIdleCallback?: (handle: number) => void;
  }
}

function removeChatlingArtifacts() {
  const script = document.getElementById(SCRIPT_ID);
  if (script) {
    script.remove();
  }

  const possibleSelectors = [
    '#chatling-container',
    '#chatling-bubble',
    '#chatling-iframe',
    '.chatling-launcher',
    '.chatling-widget',
    'iframe[src*="chatling"]'
  ];

  possibleSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((node) => {
      node.remove();
    });
  });

  delete window.chtlConfig;
}

export function ChatlingWidget() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const isDashboard = pathname.startsWith('/dashboard');

    if (isDashboard) {
      removeChatlingArtifacts();
      return;
    }

    window.chtlConfig = { chatbotId: CHATBOT_ID };

    const loadScript = () => {
      if (document.getElementById(SCRIPT_ID)) {
        return;
      }
      const script = document.createElement('script');
      script.async = true;
      script.id = SCRIPT_ID;
      script.setAttribute('data-id', CHATBOT_ID);
      script.type = 'text/javascript';
      script.src = 'https://chatling.ai/js/embed.js';
      document.body.appendChild(script);
    };

    const idleHandle = window.requestIdleCallback
      ? window.requestIdleCallback(loadScript)
      : window.setTimeout(loadScript, 2000);

    return () => {
      if (isDashboard) {
        removeChatlingArtifacts();
      }
      if (window.cancelIdleCallback && typeof idleHandle === 'number') {
        window.cancelIdleCallback(idleHandle);
      } else {
        window.clearTimeout(idleHandle as number);
      }
    };
  }, [pathname]);

  return null;
}

export default ChatlingWidget;
