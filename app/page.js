"use client";

import Script from "next/script";
import { useEffect } from "react";

export default function Page() {

  return (
    <>
      <nav className="navbar navbar-dark bg-dark">
        <a className="navbar-brand" href="#">Encleso Demo</a>
      </nav>

      <div className="container mt-3">
        <div className="row">
          <div className="col-12 col-lg-4">
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <label className="input-group-text" htmlFor="ScannerName">Scanner</label>
              </div>
              <select className="custom-select" id="ScannerName">
                <option>Choose...</option>
              </select>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <label className="input-group-text" htmlFor="resolution">Resolution (DPI)</label>
              </div>
              <select className="custom-select" id="resolution">
                <option>Choose...</option>
              </select>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <label className="input-group-text" htmlFor="colorMode">Color Mode</label>
              </div>
              <select className="custom-select" id="colorMode">
                <option>Choose...</option>
              </select>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12 col-sm-6 col-xl-3 offset-xl-3">
            <div className="form-check text-center mb-3">
              <input className="form-check-input" type="checkbox" value="" id="chkShowUI" defaultChecked />
              <label className="form-check-label" htmlFor="chkShowUI">Show Driver Interface</label>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="form-check text-center mb-3">
              <input className="form-check-input" type="checkbox" value="" id="chkDuplex" />
              <label className="form-check-label" htmlFor="chkDuplex">Duplex Mode</label>
            </div>
          </div>
        </div>
      </div>

      <hr className="mt-0" />

      <div className="w-100 text-center d-flex flex-column align-items-center">
        <button
          type="button"
          id="btnScan"
          className="btn btn-primary mb-3"
          onClick={() => typeof window !== "undefined" && window.StartScanning && window.StartScanning()}
        >
          Scan Now...
        </button>
      </div>

      <hr className="mt-0" />

      <div className="container mt-3">
        <div className="row">
          <div className="col-12 col-lg-4 offset-lg-3">
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <label className="input-group-text" htmlFor="imageFormat">Image Format</label>
              </div>
              <select className="custom-select" id="imageFormat" defaultValue="jpg" disabled>
                <option value="jpg">JPEG</option>
                <option value="png">PNG</option>
                <option value="tiff-single">TIFF</option>
                <option value="bmp">BMP</option>
                <option value="pdf-single">PDF</option>
              </select>
            </div>
          </div>

          <div className="col-12 col-lg-2 text-center">
            <button
              type="button"
              id="btnSave"
              className="btn btn-primary mb-3"
              style={{ minWidth: "6.65rem" }}
              onClick={() => typeof window !== "undefined" && window.SaveImageToFilesystem && window.SaveImageToFilesystem()}
              disabled
            >
              Save
            </button>
          </div>
        </div>

        <div className="alert alert-warning d-none text-center" role="alert" id="alert-warn-error"></div>
        <img id="ScanOutput" className="d-none img-fluid" alt="Scan Output" />
      </div>

      {/* Scripts: jQuery -> Bootstrap -> Encleso -> app script */}
      <Script
        src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.3/jquery.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-Fy6S3B9q64WdZWQUiU+q4/2Lc9npb8tCaSX9FK7E8HnRr0Jz8D6OP9dO5Vg3Q9ct"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <Script
        src="https://encleso.com/Assets/scripts/encleso.min.js"
        strategy="afterInteractive"
      />
      <Script src="/encleso-demo.js" strategy="afterInteractive" />
    </>
  );
}


