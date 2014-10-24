// Saves options to chrome.storage
function save_options() {  
  var debugMode = document.getElementById('debug').checked;
  var showExtension = document.getElementById('show_ext').checked;
  var cleanFilename = document.getElementById('clean_filename').checked;
  
  chrome.storage.sync.set({
    debugMode: debugMode,
    showExtension: showExtension,
    cleanFilename: cleanFilename
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value debugMode = true.
  chrome.storage.sync.get({
    debugMode: true,
    showExtension: false,
    cleanFilename: false
  }, function(items) {
    document.getElementById('debug').checked = items.debugMode;
    document.getElementById('show_ext').checked = items.showExtension;
    document.getElementById('clean_filename').checked = items.cleanFilename;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);