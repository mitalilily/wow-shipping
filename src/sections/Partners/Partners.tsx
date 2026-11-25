import tree from '../../recovered/Partners.json';
import { RecoveredTree } from '../../components/shared/RecoveredTree';

/** Restored Partners structure; original SVGs and layout hooks retained. */
export function Partners() { return <RecoveredTree tree={tree} />; }
