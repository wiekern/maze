var vorwaertJson = {
  "type": "vorwaert",
  "message0": "vorwärts laufen",
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
};

Blockly.Blocks['vorwaert'] = {
	init: function() {
	    this.jsonInit(vorwaertJson);
	    // Assign 'this' to a variable for use in the tooltip closure below.
	    var thisBlock = this;
	    this.setTooltip(function() {
	      return 'Add a number to variable "%1".'.replace('%1',
	          thisBlock.getFieldValue('VAR'));
	    });
	  }
};


var abbiegenJson = {
  "type": "abbiegen",
  "message0": "%1",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "abbiegen",
      "options": [
        [
          "links abbiegen",
          "links"
        ],
        [
          "rechts abbiegen",
          "rechts"
        ]
      ]
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
};

Blockly.Blocks['abbiegen'] = {
	init: function() {
	    this.jsonInit(abbiegenJson);
	    // Assign 'this' to a variable for use in the tooltip closure below.
	    var thisBlock = this;
	    this.setTooltip(function() {
	      return 'Add a number to variable "%1".'.replace('%1',
	          thisBlock.getFieldValue('VAR'));
	    });
	  }
};

