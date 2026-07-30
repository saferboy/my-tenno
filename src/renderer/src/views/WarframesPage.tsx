import ItemGrid from '../components/ItemGrid'
import { WARFRAME_CATEGORIES } from '../constants'

function WarframesPage(): React.JSX.Element {
  return <ItemGrid title="Warframes" categoryScope={WARFRAME_CATEGORIES} />
}

export default WarframesPage
