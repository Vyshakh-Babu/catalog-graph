import { createContext, useContext, useState } from "react";

export const PriceContext = createContext();
export const usePrice = () => useContext(PriceContext);

export const PriceProvider = ({ children }) => {
  const [price, setPrice] = useState({ amount: 0, difference: 0 });

  return (
    <PriceContext.Provider value={{ price, setPrice }}>
      {children}
    </PriceContext.Provider>
  );
};
