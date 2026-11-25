/** Reviewed, inert section data recovered from the authorized homepage export. */
export type RecoveredNode = string | {
  tag: string;
  attrs: Record<string, string>;
  children: RecoveredNode[];
};
