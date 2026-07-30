import ItemGrid from '../components/ItemGrid'
import { WEAPONS_PAGE_CATEGORIES } from '../constants'

function WeaponsPage(): React.JSX.Element {
  return <ItemGrid title="Weapons" categoryScope={WEAPONS_PAGE_CATEGORIES} />
}

export default WeaponsPage
