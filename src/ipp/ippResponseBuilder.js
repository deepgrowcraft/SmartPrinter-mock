//
//  ippResponseBuilder.js
//  SmartPrinter-MockServer
//  RFC 8010 / RFC 8011 IPP Response Builder for Apple AirPrint & Universal IPP
//

class IPPResponseBuilder {
  buildPrinterAttributesResponse(req, profile, stateInfo, hostIP) {
    const printerURI = `ipp://${hostIP}:${profile.port}/ipp/print`;
    
    return {
      version: req.version || '2.0',
      statusCode: 'successful-ok',
      id: req.id || 1,
      'operation-attributes-tag': {
        'attributes-charset': 'utf-8',
        'attributes-natural-language': 'en-us'
      },
      'printer-attributes-tag': {
        'printer-uri-supported': [printerURI],
        'uri-security-supported': ['none'],
        'uri-authentication-supported': ['none'],
        'printer-name': profile.name,
        'printer-location': profile.note || 'Local Wi-Fi Network',
        'printer-info': profile.description || profile.name,
        'printer-make-and-model': profile.model,
        'printer-state': stateInfo.state || 'idle',
        'printer-state-reasons': stateInfo.reasons || 'none',
        'printer-state-message': stateInfo.reasons === 'none' ? 'Ready to print' : `Status: ${stateInfo.reasons}`,
        'printer-is-accepting-jobs': stateInfo.accepting !== false,
        'queued-job-count': 0,
        
        // Supported Operations: Print-Job(2), Validate-Job(4), Cancel-Job(8), Get-Job-Attributes(9), Get-Jobs(10), Get-Printer-Attributes(11)
        'operations-supported': [
          'Print-Job',
          'Validate-Job',
          'Cancel-Job',
          'Get-Job-Attributes',
          'Get-Jobs',
          'Get-Printer-Attributes'
        ],
        'charset-configured': 'utf-8',
        'charset-supported': ['utf-8'],
        'natural-language-configured': 'en-us',
        'generated-natural-language-supported': ['en-us'],
        
        // Critical for iOS AirPrint
        'document-format-supported': [
          'application/pdf',
          'image/urf',
          'image/jpeg',
          'application/postscript',
          'application/octet-stream'
        ],
        'document-format-default': 'application/pdf',
        
        // Color & Duplex
        'color-supported': profile.color === true,
        'print-color-mode-supported': profile.color ? ['color', 'monochrome'] : ['monochrome'],
        'print-color-mode-default': profile.color ? 'color' : 'monochrome',
        
        'sides-supported': profile.duplex ? ['one-sided', 'two-sided-long-edge', 'two-sided-short-edge'] : ['one-sided'],
        'sides-default': 'one-sided',
        
        // Media Sizes
        'media-supported': profile.media || ['iso_a4_210x297mm', 'na_letter_8.5x11in'],
        'media-default': profile.defaultMedia || 'iso_a4_210x297mm',
        
        // Apple Raster Specification
        'urf-supported': ['V1.4', 'W8', 'SRGB24', 'CP1', 'RS600', 'DM1'],
        
        'ipp-versions-supported': ['1.0', '1.1', '2.0'],
        'multiple-document-jobs-supported': false,
        'copies-supported': { lower: 1, upper: 99 },
        'copies-default': 1,
        'page-ranges-supported': true
      }
    };
  }

  buildValidateJobResponse(req) {
    return {
      version: req.version || '2.0',
      statusCode: 'successful-ok',
      id: req.id || 1,
      'operation-attributes-tag': {
        'attributes-charset': 'utf-8',
        'attributes-natural-language': 'en-us'
      }
    };
  }

  buildPrintJobResponse(req, job, hostIP, port) {
    return {
      version: req.version || '2.0',
      statusCode: 'successful-ok',
      id: req.id || 1,
      'operation-attributes-tag': {
        'attributes-charset': 'utf-8',
        'attributes-natural-language': 'en-us'
      },
      'job-attributes-tag': {
        'job-id': job.id,
        'job-uri': `ipp://${hostIP}:${port}/jobs/${job.id}`,
        'job-state': 'completed',
        'job-state-reasons': 'job-completed-successfully',
        'job-name': job.name
      }
    };
  }

  buildGetJobAttributesResponse(req, job) {
    return {
      version: req.version || '2.0',
      statusCode: 'successful-ok',
      id: req.id || 1,
      'operation-attributes-tag': {
        'attributes-charset': 'utf-8',
        'attributes-natural-language': 'en-us'
      },
      'job-attributes-tag': {
        'job-id': job ? job.id : 1,
        'job-state': 'completed',
        'job-state-reasons': 'job-completed-successfully'
      }
    };
  }

  buildErrorResponse(req, statusCode, message) {
    return {
      version: req.version || '2.0',
      statusCode: statusCode || 'server-error-internal-error',
      id: req.id || 1,
      'operation-attributes-tag': {
        'attributes-charset': 'utf-8',
        'attributes-natural-language': 'en-us',
        'status-message': message || 'Error'
      }
    };
  }
}

module.exports = new IPPResponseBuilder();

