import React from 'react';
import { NiftyPinEntry } from '../nifty/NiftyPinEntry';

// We reuse the logic but can customize the title
export const SensexPinEntry: React.FC<any> = (props) => {
  return <NiftyPinEntry {...props} />;
};