
import React from 'react';
import { Button } from './Button';
import { IconCoffee } from './Icons';

const BuyMeACoffeeButtonComponent: React.FC = () => {
  // IMPORTANT: Replace with your actual Buy Me a Coffee link
  const coffeeLink = "https://www.buymeacoffee.com/yourusername"; 

  return (
    <a
      href={coffeeLink}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block"
      aria-label="Support the developer by buying them a coffee"
    >
      <Button variant="warning" className="group">
        <IconCoffee className="w-5 h-5 mr-2 transition-transform duration-200 ease-in-out group-hover:scale-110" />
        Buy Me a Coffee
      </Button>
    </a>
  );
};

export const BuyMeACoffeeButton = React.memo(BuyMeACoffeeButtonComponent);
