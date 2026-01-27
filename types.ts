
export interface Review {
  id: string;
  userName: string;
  rating: number;
  text: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  sizes: string[];
  colors: string[];
  reviews?: Review[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
}

export enum Category {
  EVENING = 'Вечерние',
  CASUAL = 'Повседневные',
  COCKTAIL = 'Коктейльные',
  OFFICE = 'Офисные',
  SUMMER = 'Летние'
}
