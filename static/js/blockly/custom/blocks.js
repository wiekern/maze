var blocksJson = [{
  "type": "vorwaert",
  "message0": "vorwärts laufen",
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
},
{
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
},
{
  "type": "winkel",
  "message0": "wenn %1 ist %2 %3 ausführen %4",
  "args0": [
    {
      "type": "field_variable",
      "name": "aktuellWinkel",
      "variable": "winkel"
    },
    {
      "type": "field_angle",
      "name": "winkelNumber",
      "angle": 90
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "winkelBlock"
    }
  ],
  "inputsInline": false,
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "bisende",
  "message0": "widerholen bis %1 %2 ausführen %3",
  "args0": [
    {
      "type": "field_image",
      "src": "https://image.flaticon.com/icons/svg/126/126470.svg",
      "width": 15,
      "height": 15,
      "alt": "*"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "bisEndeBlock"
    }
  ],
  "previousStatement": null,
  "colour": 120,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "uniaktion",
  "message0": "wenn Pfad %1 %2 ausführen %3",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "nextStep",
      "options": [
        [
          "geradeaus ist",
          "geradeaus"
        ],
        [
          "nach links ist",
          "links"
        ],
        [
          "nach rechts ist",
          "rechts"
        ]
      ]
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "uniAktionBlock"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "biaktion",
  "message0": "wenn Pfad %1 %2 ausführen %3 sonst %4",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "nextStep",
      "options": [
        [
          "geradeaus ist",
          "geradeaus"
        ],
        [
          "nach links ist",
          "links"
        ],
        [
          "nach rechts ist",
          "rechts"
        ]
      ]
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "jaAktion"
    },
    {
      "type": "input_statement",
      "name": "neinAktion"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
}];

for (let i = 0; i < blocksJson.length; i++) {
	console.log(blocksJson[i].type);
	Blockly.Blocks[blocksJson[i].type] = {
		init: function() {
	    this.jsonInit(blocksJson[i]);
	    // Assign 'this' to a variable for use in the tooltip closure below.
	    var thisBlock = this;
	    this.setTooltip(function() {
	      return '';
	    });
	  }
	};
}


Blockly.JavaScript['vorwaert'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '$(\'#go-forward\').click();';
  return code;
};

Blockly.JavaScript['abbiegen'] = function(block) {
  var dropdown_abbiegen = block.getFieldValue('abbiegen');
  var code = '';
  // TODO: Assemble JavaScript into code variable.
  if (dropdown_abbiegen === 'links') {
  	code = '$(\'#turn-left\').click()';

  } else if (dropdown_abbiegen === 'rechts'){
	code = '$(\'#turn-right\').click();';
  }
  return code;
};

Blockly.JavaScript['winkel'] = function(block) {
  var variable_aktuellwinkel = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('aktuellWinkel'), Blockly.Variables.NAME_TYPE);
  var angle_winkelnumber = block.getFieldValue('winkelNumber');
  var statements_name = Blockly.JavaScript.statementToCode(block, 'winkelBlock');
  // TODO: Assemble JavaScript into code variable.
  var code = '...;\n';
  return code;
};

Blockly.JavaScript['bisende'] = function(block) {
  var statements_bisendeblock = Blockly.JavaScript.statementToCode(block, 'bisEndeBlock');
  // TODO: Assemble JavaScript into code variable.
  var code = '...;\n';
  return code;
};

Blockly.JavaScript['uniaktion'] = function(block) {
  var dropdown_nextstep = block.getFieldValue('nextStep');
  var statements_name = Blockly.JavaScript.statementToCode(block, 'uniAktionBlock');
  // TODO: Assemble JavaScript into code variable.
  var code = '...;\n';
  return code;
};

Blockly.JavaScript['biaktion'] = function(block) {
  var dropdown_nextstep = block.getFieldValue('nextStep');
  var statements_jaaktion = Blockly.JavaScript.statementToCode(block, 'jaAktion');
  var statements_neinaktion = Blockly.JavaScript.statementToCode(block, 'neinAktion');
  // TODO: Assemble JavaScript into code variable.
  var code = '...;\n';
  return code;
};


