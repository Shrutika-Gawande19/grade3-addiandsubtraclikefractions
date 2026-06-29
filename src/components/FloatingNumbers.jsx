import { useEffect, useState } from 'react';

const FLOATING_FRACTIONS = [
  '1/2', '2/3', '1/3', '3/4', '1/4', '2/5', '3/5', 
  '4/5', '5/6', '1/6', '3/8', '5/8', '7/8', '3/10', '9/10'
];

export default function FloatingNumbers() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Generate 12 floating fractions with randomized styling
    const newItems = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      text: FLOATING_FRACTIONS[i % FLOATING_FRACTIONS.length],
      left: `${Math.random() * 90 + 5}%`,
      delay: `${Math.random() * 12}s`,
      duration: `${20 + Math.random() * 15}s`,
      size: `${1.8 + Math.random() * 1.5}rem`,
    }));
    setItems(newItems);
  }, []);

  return (
    <div className="floating-numbers" aria-hidden="true">
      {items.map(item => (
        <div
          key={item.id}
          className="floating-number"
          style={{
            left: item.left,
            animationDelay: item.delay,
            animationDuration: item.duration,
            fontSize: item.size,
            opacity: 0.05
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}
