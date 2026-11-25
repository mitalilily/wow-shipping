import tree from '../../recovered/FinalCTA.json';
import { RecoveredTree } from '../../components/shared/RecoveredTree';

/** Restored FinalCTA structure; original SVGs and layout hooks retained. */
export function FinalCTA() { return <RecoveredTree tree={tree} />; }
