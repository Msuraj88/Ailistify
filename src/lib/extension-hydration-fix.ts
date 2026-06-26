export const extensionHydrationFixScript = `
(function () {
  var ATTRS = ["bis_skin_checked", "bis_register", "fdprocessedid"];

  function stripAttributes(node) {
    if (!node || node.nodeType !== 1) {
      return;
    }

    for (var i = 0; i < ATTRS.length; i++) {
      var attr = ATTRS[i];
      if (node.hasAttribute(attr)) {
        node.removeAttribute(attr);
      }
    }
  }

  function stripTree(root) {
    stripAttributes(root);
    if (!root.querySelectorAll) {
      return;
    }

    for (var i = 0; i < ATTRS.length; i++) {
      var nodes = root.querySelectorAll("[" + ATTRS[i] + "]");
      for (var j = 0; j < nodes.length; j++) {
        nodes[j].removeAttribute(ATTRS[i]);
      }
    }
  }

  function boot() {
    stripTree(document.documentElement);

    new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var record = records[i];

        if (
          record.type === "attributes" &&
          ATTRS.indexOf(record.attributeName) !== -1
        ) {
          record.target.removeAttribute(record.attributeName);
        }

        if (record.addedNodes) {
          for (var j = 0; j < record.addedNodes.length; j++) {
            stripTree(record.addedNodes[j]);
          }
        }
      }
    }).observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ATTRS,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
`;
