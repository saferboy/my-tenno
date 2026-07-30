import ItemGrid from '../components/ItemGrid'
import { MY_COLLECTION_CATEGORIES } from '../constants'

// Umumiy katalog o'rniga faqat egalik qilingan qurol/Warframe/hamrohlarni
// doimiy ko'rsatadigan qisqa yo'l - foydalanuvchi har safar OWNED filtrini
// bosishi shart emas.
function MyCollection(): React.JSX.Element {
  return <ItemGrid title="Mening qurollarim" categoryScope={MY_COLLECTION_CATEGORIES} defaultStatusFilter="owned" />
}

export default MyCollection
