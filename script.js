
fetch('/api/files')
    .then(response => response.json())
    .then(files => {
        const container = document.getElementById('file-container');
        
        files.forEach(file => {
            const wrapper = document.createElement('div');
            const fileLink = document.createElement('a');
            
            // Set the link target
            fileLink.href = file.path;
            fileLink.textContent = file.filename; // Displays the name
            fileLink.target = "_blank"; // Opens in new tab
            
            // Check if it's an image to show a preview
            if (file.path.match(/\.(jpeg|jpg|png|gif|webp)$/i)) {
                const img = document.createElement('img');
                img.src = file.path;
                img.style.display = 'block';
                img.style.maxWidth = '200px';
                wrapper.appendChild(img);
            }
            
            wrapper.appendChild(fileLink);
            container.appendChild(wrapper);
        });
    })
    .catch(error => console.error('Error loading files:', error));
    
   document.getElementById('wipebtn').addEventListener('click', async () => {
     await fetch ('/truncate-db', {method: 'POST'})
     location.reload();
   });
  
   