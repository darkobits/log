import env from '@darkobits/env';


/**
 * @private
 *
 * Generates a pattern for testing candidate namespaces for debug-ability based
 * on the 'DEBUG` environment variable.
 */
function generateDebugNamespaceRegex(debugEnvVar: string) {
  // Split on comma or space.
  const splitNamespaces = debugEnvVar.split(/[ ,]/g);

  // If the list of namespaces includes the global wildcard, return a regular
  // expression that always matches.
  if (splitNamespaces.includes('*')) {
    return /.*/g;
  }

  const isWildcardNamespace = (str: string) => /.*:\*/g.test(str);

  // Build up a string we will use to construct a regular expression instance.
  const isDebugNamespacePattern = splitNamespaces.reduce((patterns, curNamespace) => {
    // Ex: For namespace expressions like "foo:*", enable debugging on
    // namespaces that are "foo" plus any namespaces beginning with "foo:".
    if (isWildcardNamespace(curNamespace)) {
      return [...patterns, `(^${curNamespace}$)|(^${curNamespace}:.*$)`];
    }

    return [...patterns, `(^${curNamespace}$)`];
  }, []).join('|');

  return new RegExp(isDebugNamespacePattern);
}


/**
 * @private
 *
 * Regular expression used to determine if a namespace is being debugged.
 */
let isDebugNamespaceRegex: RegExp;


/**
 * Provided a candidate namespace, returns `true` if the namespace has been
 * flagged for debugging according to the 'DEBUG' environment variable.
 */
export default function isDebugNamespace(testNamespace: string) {
  if (!env('DEBUG')) {
    return false;
  }

  // Parse the 'DEBUG' environment variable once, the first time we are called.
  if (!isDebugNamespaceRegex) {
    isDebugNamespaceRegex = generateDebugNamespaceRegex(env('DEBUG'));
  }

  return isDebugNamespaceRegex.test(testNamespace);
}
