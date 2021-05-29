// Function to lighten / dark hex colors using Javascript

// colorLuminance: takes in hex color and lum value, 
// returns new hex value with luminosity lum

// lum < 0: lighter
// lum = 0: same
// lum > 0: darker

function colorLuminance(hex, lum) {
  // Validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, "");
  if (hex.length < 6) {
    hex = hex.replace(/(.)/g, '$1$1');
  }
  lum = lum || 0;
  // Convert to decimal and change luminosity
  var rgb = "#",
    c;
  for (var i = 0; i < 3; ++i) {
    c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
    rgb += ("00" + c).substr(c.length);
  }
  return rgb;
}

export { colorLuminance };