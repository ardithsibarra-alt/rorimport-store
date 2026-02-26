export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Bisutería' | 'Cosméticos' | 'Sport';
  image: string;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface InternationalOrderForm {
  productLink: string;
  description: string;
  quantity: number;
}
