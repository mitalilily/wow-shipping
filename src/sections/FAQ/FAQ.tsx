import tree from '../../recovered/FAQ.json';
import { RecoveredTree } from '../../components/shared/RecoveredTree';

/** Restored FAQ structure; original SVGs and layout hooks retained. */
export function FAQ() { return <RecoveredTree tree={tree} />; }
