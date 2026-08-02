import ItemGrid from '../components/ItemGrid'
import { MY_COLLECTION_CATEGORIES } from '../constants'
import { useT } from '../i18n/useT'

// Umumiy katalog o'rniga faqat egalik qilingan qurol/Warframe/hamrohlarni
// doimiy ko'rsatadigan qisqa yo'l - foydalanuvchi har safar OWNED filtrini
// bosishi shart emas.
function MyCollection(): React.JSX.Element {
  const t = useT()
  return (
    <ItemGrid
      title={t('sidebar.nav.myCollection')}
      categoryScope={MY_COLLECTION_CATEGORIES}
      defaultStatusFilter="owned"
    />
  )
}

export default MyCollection
