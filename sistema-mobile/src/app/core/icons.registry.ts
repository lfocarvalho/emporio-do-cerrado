import { addIcons } from 'ionicons';
import {
  homeOutline,
  pricetagsOutline,
  cartOutline,
  heartOutline,
  heart,
  bagOutline,
  heartSharp,
  personOutline,
  searchOutline,
  menuOutline,
} from 'ionicons/icons';

// Registra todos os ícones usados no app em um único lugar para evitar
// carregamento dinâmico por URL dentro do WebView (que pode causar erros
// de "Invalid base URL" em alguns ambientes).
export function registerAppIcons() {
  addIcons({
    homeOutline,
    pricetagsOutline,
    cartOutline,
    heartOutline,
    heart,
    bagOutline,
    heartSharp,
    personOutline,
    searchOutline,
    menuOutline,
  });
}
