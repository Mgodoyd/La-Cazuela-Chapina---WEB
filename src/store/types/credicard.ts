export interface CreditCardPaymentProps {
    onClose: () => void;
    onSuccess: () => void;
    orderData: any;
    totalAmount: number;
  }
  