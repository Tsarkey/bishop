
/* protect.js: blocks common copy actions */
(function(){
  try {
    document.addEventListener('contextmenu', function(e){ e.preventDefault(); }, false);
    document.addEventListener('copy', function(e){ e.preventDefault(); }, false);
    document.addEventListener('cut', function(e){ e.preventDefault(); }, false);
    document.addEventListener('dragstart', function(e){ e.preventDefault(); }, false);
    document.addEventListener('selectstart', function(e){ e.preventDefault(); }, false);
    window.addEventListener('keydown', function(e){
      // Block Ctrl+S, Ctrl+U, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+C, F12
      var key = e.key || e.keyIdentifier || e.which;
      var k = (typeof key === 'string') ? key.toLowerCase() : '';
      if (
          (e.ctrlKey && (k === 's' || k === 'u' || k === 'c')) ||
          (e.ctrlKey && e.shiftKey && (k === 'i' || k === 'c')) ||
          k === 'f12'
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, false);
    // also disable save-as via beforeunload? no.
  } catch(err){ console.error('protect.js error', err); }
})();
