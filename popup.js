document.addEventListener('DOMContentLoaded', function() {
  loadSocialLinks();
  loadSavedFiles();

  document.getElementById('addLink').addEventListener('click', addNewLink);
  document.getElementById('saveFile').addEventListener('click', openSaveFileModal);
  document.getElementById('modalSave').addEventListener('click', saveFile);
  document.getElementById('modalCancel').addEventListener('click', closeSaveFileModal);
  document.getElementById('fileInput').addEventListener('change', updateUploadStatus);
});
  function loadSocialLinks() {
    chrome.storage.sync.get('socialLinks', function(data) {
      const links = data.socialLinks || [];
      const socialLinksDiv = document.getElementById('socialLinks');
      socialLinksDiv.innerHTML = '';
  
      links.forEach(function(link, index) {
        const linkDiv = createLinkElement(link, index);
        socialLinksDiv.appendChild(linkDiv);
      });
    });
  }
  
  function createLinkElement(link, index) {
    const linkDiv = document.createElement('div');
    linkDiv.className = 'social-link';
  
    const icon = document.createElement('img');
    icon.src = `icons/${link.site.toLowerCase()}.png`;
    icon.alt = link.site;
    icon.onerror = function() {
      this.src = 'icons/default.png';
    };
  
    const linkInfo = document.createElement('div');
    linkInfo.appendChild(icon);
    const linkText = document.createElement('span');
    linkText.className = 'social-link-text';
    linkText.textContent = link.url;
    linkInfo.appendChild(linkText);
    
    const actionsDiv = document.createElement('div');

    const copyIcon = document.createElement('i');
    copyIcon.className = 'fas fa-copy action-icon';
    copyIcon.title = 'Copy link';
    copyIcon.addEventListener('click', function() {
      navigator.clipboard.writeText(link.url);
      copyIcon.className = 'fas fa-check action-icon';
      setTimeout(() => {
        copyIcon.className = 'fas fa-copy action-icon';
      }, 2000);
    });

    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fas fa-trash action-icon delete-icon';
    deleteIcon.title = 'Delete link';
    deleteIcon.addEventListener('click', function() {
      deleteLink(index);
    });

    actionsDiv.appendChild(copyIcon);
    actionsDiv.appendChild(deleteIcon);
  
    linkDiv.appendChild(linkInfo);
    linkDiv.appendChild(actionsDiv);
  
    return linkDiv;
  }
  
  function addNewLink() {
    const site = prompt('Enter the social media site name:');
    const url = prompt('Enter your profile URL:');
  
    if (site && url) {
      chrome.storage.sync.get('socialLinks', function(data) {
        const links = data.socialLinks || [];
        links.push({ site, url });
        chrome.storage.sync.set({ socialLinks: links }, loadSocialLinks);
      });
    }
  }
  
  function deleteLink(index) {
    chrome.storage.sync.get('socialLinks', function(data) {
      const links = data.socialLinks || [];
      links.splice(index, 1);
      chrome.storage.sync.set({ socialLinks: links }, loadSocialLinks);
    });
  }
  
  function openSaveFileModal() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length > 0) {
      document.getElementById('modal').style.display = 'block';
    } else {
      alert('Please select a file first.');
    }
  }
  
  function closeSaveFileModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('modalFileName').value = '';
  }
  
  function saveFile() {
    const fileInput = document.getElementById('fileInput');
    const fileName = document.getElementById('modalFileName').value;
  
    if (fileInput.files.length > 0 && fileName) {
      const file = fileInput.files[0];
      const reader = new FileReader();
  
      reader.onload = function(e) {
        const fileData = {
          name: fileName,
          type: file.type,
          data: e.target.result
        };
  
        chrome.storage.local.get('savedFiles', function(data) {
          const files = data.savedFiles || [];
          files.push(fileData);
          chrome.storage.local.set({ savedFiles: files }, function() {
            loadSavedFiles();
            closeSaveFileModal();
            fileInput.value = ''; // Clear the file input
          });
        });
      };
  
      reader.readAsDataURL(file);
    } else {
      alert('Please enter a file name.');
    }
  }
  
  function loadSavedFiles() {
    chrome.storage.local.get('savedFiles', function(data) {
      const files = data.savedFiles || [];
      const savedFilesDiv = document.getElementById('savedFiles');
      savedFilesDiv.innerHTML = '';
  
      files.forEach(function(file, index) {
        const fileDiv = createFileElement(file, index);
        savedFilesDiv.appendChild(fileDiv);
      });
    });
  }
  
  function createFileElement(file, index) {
    const fileDiv = document.createElement('div');
    fileDiv.className = 'saved-file';
  
    const fileName = document.createElement('span');
    fileName.textContent = file.name;
  
    const fileActions = document.createElement('div');
    fileActions.className = 'file-actions';
  
    const downloadIcon = document.createElement('i');
    downloadIcon.className = 'fas fa-download action-icon';
    downloadIcon.title = 'Download file';
    downloadIcon.addEventListener('click', function() {
      downloadFile(file);
    });

    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fas fa-trash action-icon delete-icon';
    deleteIcon.title = 'Delete file';
    deleteIcon.addEventListener('click', function() {
      deleteFile(index);
    });

    fileActions.appendChild(downloadIcon);
    fileActions.appendChild(deleteIcon);
  
    fileDiv.appendChild(fileName);
    fileDiv.appendChild(fileActions);
  
    return fileDiv;
  }
  
  function downloadFile(file) {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  function deleteFile(index) {
    chrome.storage.local.get('savedFiles', function(data) {
      const files = data.savedFiles || [];
      files.splice(index, 1);
      chrome.storage.local.set({ savedFiles: files }, loadSavedFiles);
    });
  }

  