import React from 'react';
import { SubtractionPinEntry } from '../subtraction/SubtractionPinEntry';

// Reuses the same PIN entry component with identical behavior
export const MentalMathPinEntry: React.FC<any> = (props) => {
    return <SubtractionPinEntry {...props} />;
};
