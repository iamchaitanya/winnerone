import React from 'react';
import { AdditionPinEntry } from '../addition/AdditionPinEntry';

// Re-use the AdditionPinEntry component — identical UI and logic
export const SubtractionPinEntry: React.FC<any> = (props) => {
    return <AdditionPinEntry {...props} />;
};
