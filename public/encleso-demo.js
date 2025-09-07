//
// Encleso JS (User component) - Next.js public script
//
"use strict";

const EMPTY_COMBOSELECT = "<option selected>Choose...</option>";
const CAPCTL_UNSUPPORTED_INNERHTML = "Unsupported";
const CAPCOMBO_UNSUPPORTEDCAP_INNERHTML = `<option selected>- ${CAPCTL_UNSUPPORTED_INNERHTML} -</option>`;

// Set the state of the scanner capabilities controls
function SetScannerCapsControlsState(bReady, jsonCaps = null) {
   if (bReady == false) {
      $("#btnScan").prop('disabled', true);
      $('#resolution').html(EMPTY_COMBOSELECT).attr('disabled', true);
      $('#colorMode').html(EMPTY_COMBOSELECT).attr('disabled', true);
      $('#chkDuplex').attr('disabled', true);
      $('#chkShowUI').attr('disabled', true);
   } else {
      $("#btnScan").prop('disabled', jsonCaps == null ? true : false);
      $('#chkShowUI').attr('disabled', jsonCaps == null ? true : false);

      // Resolution
      if (jsonCaps && jsonCaps.Resolution && jsonCaps.Resolution.Values.length > 0) {
         var options = '';
         for (let i = 0; i < jsonCaps.Resolution.Values.length; i++) {
            options +=
            `<option ${(i == jsonCaps.Resolution.CurrentIndex) ? 'selected' : ''} value="${jsonCaps.Resolution.Values[i]}">` +
               jsonCaps.Resolution.Values[i] + ' x ' + jsonCaps.Resolution.Values[i] +
            `</option>`;
         }
         $('#resolution').html(options).attr('disabled', !jsonCaps.Resolution.ChangeAllowed);
      } else {
         $('#resolution').html(CAPCOMBO_UNSUPPORTEDCAP_INNERHTML).attr('disabled', true);
      }

      // Color type
      if (jsonCaps && jsonCaps.PixelType && jsonCaps.PixelType.Values.length > 0) {
         var options = '';
         for (let i = 0; i < jsonCaps.PixelType.Values.length; i++) {
            let val = jsonCaps.PixelType.Values[i];
            options +=
            `<option ${(i == jsonCaps.PixelType.CurrentIndex) ? 'selected' : ''} value="${val}">` +
               Encleso.PixelTypeToString(val) +
            `</option>`;
         }
         $('#colorMode').html(options).attr('disabled', !jsonCaps.PixelType.ChangeAllowed);
      } else {
         $('#colorMode').html(CAPCOMBO_UNSUPPORTEDCAP_INNERHTML).attr('disabled', true);
      }

      // Duplex
      if (jsonCaps && jsonCaps.Duplex.Supported) {
         $('#chkDuplex').attr('disabled', false);
         $('#chkDuplex').prop('checked', jsonCaps.Duplex.Enabled);
      } else {
         $('#chkDuplex').attr('disabled', true);
      }
   }
}

// Save the scanned image with the selected format
function SaveImageToFilesystem() {
   var format = $("#imageFormat option:selected").val();
   Encleso.SaveImageToFilesystem(format, [0]);
}

// Set the state of the scanner capabilities controls
function ShowScannedImage(bValid, imgIndex = 0, msgError = "") {
   if (bValid == false) {
      if (msgError == "") {
         $("#alert-warn-error").addClass("d-none").removeClass("d-block").html(msgError);
      } else {
         $("#alert-warn-error").removeClass("d-none").addClass("d-block").html(msgError);
      }

      $("#imageFormat").prop('disabled', true);
      $("#btnSave").prop('disabled', true);
   } else {
      Encleso.GetImagePreview(imgIndex).then(ret => {
         if (ret == null || ret.length < 1 || ret == "") return ShowScannedImage(false, 0, "Invalid Image!");

         $("#alert-warn-error").removeClass("d-block").addClass("d-none").html("");
         
         $('#ScanOutput').removeClass("d-none").addClass("d-block");
         $('#ScanOutput').attr("src", ret);

         $("#imageFormat").prop('disabled', false);
         $("#btnSave").prop('disabled', false);
      });
   }
}

// Clear the ImageLibrary contents
async function ClearImageLibrary() {
   let ScannedImageCount = await Encleso.ImageLibGetCount();
   let ImgLibIndexList = [];

   for (let i = 0; i < ScannedImageCount; i++) ImgLibIndexList.push(i);
   await Encleso.ImageLibRemove(ImgLibIndexList);
}

// Start scanning using the selected scanner
async function StartScanning() {
   var ScannerName = $('#ScannerName option:selected').val();
   var ShowUI = $("#chkShowUI").is(":checked");

   // Create 'Caps' object and pass it to the SetCapabilities() method
   let Caps = {};
   if ($('#resolution').prop('disabled') == false) Caps.Resolution = $('#resolution option:selected').val();
   if ($('#colorMode').prop('disabled') == false) Caps.PixelType = $('#colorMode option:selected').val();
   if ($('#chkDuplex').prop('disabled') == false) Caps.Duplex = $('#chkDuplex').prop('checked');
   Encleso.SetCapabilities(Caps);

   // Remove old scanned images from the ImageLibrary to receive new images
   await ClearImageLibrary();

   // Start the actual scan
   Encleso.StartScan(ScannerName, ShowUI).then(async (ret) => {
      if (ret.ScannedImagesCount < 1) {
         ShowScannedImage(false, 0, "Scan was cancelled!");
         return;
      }

      ShowScannedImage(true, 0); // Show the first image
   });
}

// Get Scanner capabilities
function GetScannerCaps() {
   // Get the name of the currently selected scanner
   var ScannerName = $('#ScannerName option:selected').val();

   SetScannerCapsControlsState(false);
   if (ScannerName == "Choose...") return;

   // Call Encleso.GetCapabilities() to get the capabilities of that scanner
   Encleso.GetCapabilities(ScannerName).then(ret => {
      SetScannerCapsControlsState(true, ret);
   });
}

// Set Encleso functions (OnError() and OnReady())
if (typeof window !== 'undefined') {
   console.log('[Encleso Demo] Script loaded, waiting for Encleso library...');
   
   // Guard until Encleso is available
   let retryCount = 0;
   const maxRetries = 100; // 5 seconds max
   
   const setHandlers = () => {
      if (typeof Encleso === 'undefined') {
         retryCount++;
         if (retryCount > maxRetries) {
            console.error('[Encleso Demo] Failed to load Encleso library after 5 seconds. Check if the Encleso service is running.');
            return;
         }
         console.log(`[Encleso Demo] Encleso not ready yet, retrying... (${retryCount}/${maxRetries})`);
         setTimeout(setHandlers, 50);
         return;
      }
      
      console.log('[Encleso Demo] Encleso library found, setting up handlers...');
      console.log('[Encleso Demo] Available Encleso functions:', Object.getOwnPropertyNames(Encleso).filter(name => typeof Encleso[name] === 'function'));
      console.log('[Encleso Demo] Full Encleso object:', Encleso);
      
             // Check connection status and try to reconnect automatically
       if (Encleso['#IsConnected'] === false) {
          console.log('[Encleso Demo] WebSocket not connected. Attempting automatic reconnection...');
          console.log('[Encleso Demo] Target URL:', Encleso['#WEBSOCKET_URL']);
          
                 // Try to trigger the Encleso library to attempt connection
       // Sometimes the library needs a "nudge" to start connecting
       if (typeof Encleso.Connect === 'function') {
          console.log('[Encleso Demo] Calling Encleso.Connect() to trigger connection...');
          try {
             Encleso.Connect();
          } catch (e) {
             console.log('[Encleso Demo] Connect() call failed:', e);
          }
       }
       
       // Test if the client app is reachable by trying to ping the WebSocket URL
       console.log('[Encleso Demo] Testing client app reachability...');
       try {
          const testSocket = new WebSocket(Encleso['#WEBSOCKET_URL']);
          testSocket.onopen = () => {
             console.log('[Encleso Demo] Client app is reachable! Closing test connection...');
             testSocket.close();
          };
          testSocket.onerror = () => {
             console.log('[Encleso Demo] Client app is NOT reachable. Is it running?');
          };
          // Close test socket after 2 seconds if it doesn't connect
          setTimeout(() => {
             if (testSocket.readyState === WebSocket.CONNECTING) {
                testSocket.close();
             }
          }, 2000);
       } catch (e) {
          console.log('[Encleso Demo] Could not test client app reachability:', e);
       }
          
          // Also try to access the WebSocket to see its state
          if (Encleso['#WebSocket']) {
             console.log('[Encleso Demo] WebSocket state:', Encleso['#WebSocket'].readyState);
             if (Encleso['#WebSocket'].readyState === WebSocket.CLOSED) {
                console.log('[Encleso Demo] WebSocket is closed, library should reconnect automatically');
             }
          }
          
          // Wait for connection to be established with more aggressive retry
          let connectionAttempts = 0;
          const maxAttempts = 200; // 10 seconds max
          
          const waitForConnection = () => {
             connectionAttempts++;
             
             if (Encleso['#IsConnected'] === true) {
                console.log('[Encleso Demo] WebSocket connected successfully!');
                setupEnclesoHandlers();
                setupConnectionMonitor();
             } else if (connectionAttempts >= maxAttempts) {
                console.error('[Encleso Demo] Failed to connect after 10 seconds. Client app may not be running.');
                $("#alert-warn-error").removeClass("d-none").addClass("d-block").html("Cannot connect to Encleso client app. Please ensure it's running and try again.");
                return;
             } else {
                // Every 20 attempts (1 second), try to trigger connection again
                if (connectionAttempts % 20 === 0) {
                   console.log('[Encleso Demo] Attempting to trigger connection again...');
                   if (typeof Encleso.Connect === 'function') {
                      try {
                         Encleso.Connect();
                      } catch (e) {
                         console.log('[Encleso Demo] Reconnection attempt failed:', e);
                      }
                   }
                }
                 
                console.log(`[Encleso Demo] Still waiting for connection... (${connectionAttempts}/${maxAttempts})`);
                setTimeout(waitForConnection, 50); // Check more frequently
             }
          };
          
          waitForConnection();
          return;
       }
       
               // Set up connection monitoring
        setupConnectionMonitor();
       
        setupEnclesoHandlers();
        
                // Monitor connection status and auto-reconnect if needed
        function setupConnectionMonitor() {
           let lastConnectionStatus = Encleso['#IsConnected'];
           
           setInterval(() => {
              const currentStatus = Encleso['#IsConnected'];
              
              if (currentStatus !== lastConnectionStatus) {
                 if (currentStatus === false && lastConnectionStatus === true) {
                    console.log('[Encleso Demo] Connection lost! Attempting to reconnect...');
                    // Clear the UI state when connection drops
                    $('#ScannerName').html(EMPTY_COMBOSELECT);
                    SetScannerCapsControlsState(true, null);
                    $("#alert-warn-error").removeClass("d-none").addClass("d-block").html("Connection lost. Attempting to reconnect...");
                    
                    // Remove functions from window
                    delete window.StartScanning;
                    delete window.SaveImageToFilesystem;
                    
                    // Try to reconnect automatically
                    attemptReconnection();
                 } else if (currentStatus === true && lastConnectionStatus === false) {
                    console.log('[Encleso Demo] Connection restored!');
                    $("#alert-warn-error").removeClass("d-block").addClass("d-none").html("");
                    setupEnclesoHandlers();
                 }
                 
                 lastConnectionStatus = currentStatus;
              }
           }, 1000); // Check every second
        }
        
        // Function to attempt reconnection
        function attemptReconnection() {
           console.log('[Encleso Demo] Attempting automatic reconnection...');
           
           // Try to trigger reconnection by accessing the WebSocket
           if (Encleso['#WebSocket']) {
              console.log('[Encleso Demo] WebSocket state:', Encleso['#WebSocket'].readyState);
           }
           
           // Wait a bit and check if connection was restored
           setTimeout(() => {
              if (Encleso['#IsConnected'] === false) {
                 console.log('[Encleso Demo] Auto-reconnection failed. Client app may need to be restarted.');
                 $("#alert-warn-error").html("Connection lost. The Encleso client app may need to be restarted.");
              }
           }, 3000);
        }
       
       function setupEnclesoHandlers() {
         Encleso.OnError = function(err) {
            $('#ScannerName').html(EMPTY_COMBOSELECT);
            SetScannerCapsControlsState(true, null);
            $("#alert-warn-error").removeClass("d-none").addClass("d-block").html(err.Message);
            setTimeout(function() { location.reload(); }, 3000);
         };
         
         Encleso.OnReady = async function(ret) {
         try {
    const res = await fetch("/api/encleso", { method: "POST" });
    const result = await res.json();
    const token = result?.enclesoResponse?.token;

    if (!token) {
      console.error("[Encleso] No license token received!");
    } else {
      const licenseResult = await Encleso.SetLicense(token);
      console.log("[Encleso] License token set:", token);
      console.log("[Encleso] License status code:", licenseResult);
      
      if (licenseResult !== 0) {
        console.warn("[Encleso] License not accepted → watermark will remain.");
      }
    }
  } catch (err) {
    console.error("[Encleso] Failed to set license:", err);
  }
            console.log('[Encleso] Connected to client application successfully!');
            console.log('[Encleso] Available scanners:', ret.ScannersList);
            
            if (ret.ScannersList.length < 1) {
               $('#ScannerName').html(EMPTY_COMBOSELECT);
               SetScannerCapsControlsState(true, null);
               $("#alert-warn-error").removeClass("d-none").addClass("d-block").html("No scanners were found! Check that your scanner is connected and turned on.");
               return;
            }

            // Go through ret.ScannersList and add scanner names to your UI
            var options = '';
            for (let i = 0; i < ret.ScannersList.length; i++) {
               options += `<option ${(i == ret.DefaultIndex) ? 'selected' : ''}>` + ret.ScannersList[i] + '</option>';
            }
            $('#ScannerName').html(options);

            // Handle 'change' event for the scanners list
            $('#ScannerName').on('change', event => {
               ShowScannedImage(false);
               $("#alert-warn-error").removeClass("d-block").addClass("d-none").html("");
               GetScannerCaps();
            });

            SetScannerCapsControlsState(false);
            GetScannerCaps();
            
                         // Expose functions on window for React onClick handlers ONLY after connection is established
             window.StartScanning = StartScanning;
             window.SaveImageToFilesystem = SaveImageToFilesystem;
         };
      }
   };

   setHandlers();
}


