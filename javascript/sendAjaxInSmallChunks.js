jQuery(document).ready(function () {
  jQuery('.ckWebclappSummeryWrapper').hide()
})
// Initialize the counter
let counter = 0

jQuery(document).on('change', '#csv_for_create_article', handleFileSelect)

function handleFileSelect (event) {
  doEmptyCsvLogFile()
  // Get the selected file
  const file = event.target.files[0]

  // Create a new FileReader instance
  const reader = new FileReader()

  // Add an event listener for when the file is loaded
  reader.addEventListener('load', handleFileLoad)

  // Read the file as text
  reader.readAsText(file)
}

function doEmptyCsvLogFile () {
  const data = {
    action: 'empty_log_csv_file',
  }
  jQuery.ajax({
    url: global_data.adminurl,
    method: 'POST',
    data: data
  })
}

function handleFileLoad (event) {
  // Get the CSV data
  const csvData = event.target.result
  var csvDataArray = jQuery.csv.toArrays(csvData)
  csvDataArray = csvDataArray.slice(1)
  renderCsvDataOnDiv(csvDataArray)
  console.log('All rows processed')
}
let CHUNK_SIZE
let TOTAL_CHUNKS
function renderCsvDataOnDiv (csvDataArray) {
  html = `<h1 style="display: flex;gap: 20px;align-items: center;">Total Row Counts ${csvDataArray.length}
    <button style="margin-top:0px" class="button button-primary ckCreateArticle"  onclick="sendAllChunks();" > Create This Article </button>
    `
  global_data.csvDataArray = csvDataArray
  // Define the chunk size and the total number of chunks
  CHUNK_SIZE = 10
  TOTAL_CHUNKS = Math.ceil(global_data.csvDataArray.length / CHUNK_SIZE)
  jQuery('.total-row-count').html(html)
}

// Define a function to send a chunk of data to the backend
function sendChunk (chunkNumber, chunkData) {
  const data = {
    action: 'create_article',
    chunk_number: chunkNumber,
    data: chunkData
  }
  return jQuery.ajax({
    url: ajaxurl,
    method: 'POST',
    data: data
  })
}

// Define a function to update the progress bar
function updateProgress (progress) {
  progressBar.update(progress)
}
let count = 1
let articlesProcessed = 0
let articlesError = 0
// Define a function to handle the response from the backend
function handleResponse (response) {
  div = jQuery('#ckResponseWrapper')
  // Process the response data
  let data = response.data.response

  for (let key in data) {
    var html = `
    <tr>
    <td>${count}</td>
    <td style="width:165px">Article No :-  ${key}</td>
    <td>
        ${JSON.stringify(data[key])}
    </td>
    </tr>
    `
    jQuery('#ckResponseWrapper table tbody').append(html)
    count++
    articlesProcessed++
    if (data[key].detail) {
      articlesError++
    }
    div.scrollTop(div[0].scrollHeight - div.height())
  }
  // Check if all the data has been processed
    var summryHtml = `
      <tr>
        <th style="padding:10px">Total Item</th>
        <td style="padding:10px">${global_data.csvDataArray.length}</td>
      </tr>

      <tr>
        <th style="padding:10px">Item Processed</th>
        <td style="padding:10px">${articlesProcessed}</td>
      </tr>

      <tr>
        <th style="padding:10px">Error Count</th>
        <td style="padding:10px">${articlesError}</td>
      </tr>
    <tr>
      <td style="padding:10px"><a class="button button-primary" style="margin-top:10px" href="/wp-content/plugins/ck-webclapp/modules/webclapp-article/log/article-log.csv"> Download Log</a> </td>
    </tr>
    `
    jQuery('.ckWebclappSummeryWrapper table tbody').html(summryHtml)
    jQuery('.ckWebclappSummeryWrapper').slideDown()
}


async function sendAllChunks () {
  // Initialize the progress bar
  const progressBar = new ProgressBar.Line('#progress-bar', {
    strokeWidth: 2,
    color: '#1abc9c',
    trailColor: '#f4f4f4',
    trailWidth: 1,
    easing: 'easeInOut',
    duration: 2000,
    text: {
      autoStyleContainer: false
    },
    from: { color: '#1abc9c', width: 1 },
    to: { color: '#1abc9c', width: 2 },
    step: function (state, circle) {
      circle.path.setAttribute('stroke', state.color)
      circle.path.setAttribute('stroke-width', state.width)

      const value = Math.round(circle.value() * 100)
      if (value === 0) {
        circle.setText('')
      } else {
        circle.setText(value + '%')
      }
    }
  })

  // Loop through all the chunks and send them one by one
  const chunkPromises = []
  for (let i = 0; i < TOTAL_CHUNKS; i++) {
    const chunkStart = i * CHUNK_SIZE
    const chunkEnd = Math.min(
      (i + 1) * CHUNK_SIZE,
      global_data.csvDataArray.length
    )
    const chunkData = global_data.csvDataArray.slice(chunkStart, chunkEnd)

    chunkPromises.push(sendChunk(i, chunkData))
  }

  // Wait for each chunk to be sent and handle its response
  for (const chunkPromise of chunkPromises) {
    const response = await chunkPromise
    handleResponse(response)

    // Update the progress bar
    const progress = chunkPromises.indexOf(chunkPromise) / chunkPromises.length
    progressBar.animate(progress)
  }

  // Update the progress bar to show that the process is complete
  progressBar.animate(1)
}
