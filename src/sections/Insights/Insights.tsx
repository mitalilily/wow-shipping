import tree from '../../recovered/Insights.json';
import { RecoveredTree } from '../../components/shared/RecoveredTree';

/** Restored Insights structure; original SVGs and layout hooks retained. */
export function Insights() { return <RecoveredTree tree={tree} />; }
