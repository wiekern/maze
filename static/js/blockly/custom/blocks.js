var blocksJson = [{
  "type": "ahead",
  "message0": "vorwärts laufen",
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "tillend",
  "message0": "wiederholen bis %1 %2 ausführen %3",
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
      "name": "tillEndStatement"
    }
  ],
  "previousStatement": null,
  "colour": 120,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "turn",
  "message0": "%1",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "turnTo",
      "options": [
        [
          "links drehen",
          "left"
        ],
        [
          "rechts drehen",
          "right"
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
  "type": "unipath",
  "message0": "wenn Pfad %1 %2 ausführen %3",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "pathFree",
      "options": [
        [
          "geradeaus frei ist",
          "up"
        ],
        [
          "nach links frei ist",
          "left"
        ],
        [
          "nach rechts frei ist",
          "right"
        ]
      ]
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "uniPathStatement"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "bipath",
  "message0": "wenn Pfad %1 %2 ausführen %3 sonst %4",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "pathFree",
      "options": [
        [
          "geradeaus frei ist",
          "up"
        ],
        [
          "nach links frei ist",
          "left"
        ],
        [
          "nach rechts frei ist",
          "right"
        ]
      ]
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "ifStatement"
    },
    {
      "type": "input_statement",
      "name": "elseStatement"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "anglecompare",
  "message0": "Winkel %1 %2 %3",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "compare",
      "options": [
        [
          "<",
          "less"
        ],
        [
          "=",
          "equal"
        ],
        [
          ">",
          "more"
        ],
        [
          "!=",
          "unequal"
        ]
      ]
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "angle",
      "check": "Number"
    }
  ],
  "inputsInline": true,
  "output": null,
  "colour": 210,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "angle",
  "message0": "%1",
  "args0": [
    {
      "type": "field_number",
      "name": "angleValue",
      "value": 0,
      "precision": 1
    }
  ],
  "output": null,
  "colour": 195,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "if",
  "message0": "wenn %1 ausführen %2",
  "args0": [
    {
      "type": "input_value",
      "name": "ifBranch"
    },
    {
      "type": "input_statement",
      "name": "ifStatement"
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
  "type": "marker",
  "message0": "Marker setzen",
  "previousStatement": null,
  "nextStatement": null,
  "colour": 180,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "markerexists",
  "message0": "Wenn %1 %2 %3 Sonst %4",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "markStatus",
      "options": [
        [
          "Marker gesetzt",
          "hasMark"
        ]
      ]
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "hasMarkStatement"
    },
    {
      "type": "input_statement",
      "name": "noMarkStatement"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 195,
  "tooltip": "",
  "helpUrl": ""
}];

for (let i = 0; i < blocksJson.length; i++) {
	// console.log(blocksJson[i].type);
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

Blockly.JavaScript['ahead'] = function(block) {
  var light = 'highlightBlock("' + block.id + '");\n'
  var code = 'moveDir("up");\n';
  return code;
};

Blockly.JavaScript['tillend'] = function(block) {
  var statements_tillendstatement = Blockly.JavaScript.statementToCode(block, 'tillEndStatement');
  // TODO: Assemble JavaScript into code variable.
  var exit = 'var timeBeginn = new Date().getTime();\n'
  var timeout = 'if ((new Date().getTime() - timeBeginn)/1000 > 5) break;\n'
  var light = 'highlightBlock("' + block.id + '");\n'
  var code = 'while(notDone()) {' + statements_tillendstatement + '}\n';
  return code;
};

Blockly.JavaScript['turn'] = function(block) {
  var dropdown_turnto = block.getFieldValue('turnTo');
  var code = '';
  var light = 'highlightBlock("' + block.id + '");\n'
  if (dropdown_turnto === 'left') {
    code = 'moveDir("left");\n';

  } else if (dropdown_turnto === 'right'){
    code = 'moveDir("right");\n';
  }
  return code;
};

Blockly.JavaScript['unipath'] = function(block) {
  var dropdown_pathfree = block.getFieldValue('pathFree');
  var statements_unipathstatement = Blockly.JavaScript.statementToCode(block, 'uniPathStatement');
  var light = 'highlightBlock("' + block.id + '");\n'
  var code = 'if (isPathFree("' + dropdown_pathfree + '")) {' + statements_unipathstatement + '}\n';
  return code;
};

Blockly.JavaScript['bipath'] = function(block) {
  var dropdown_pathfree = block.getFieldValue('pathFree');
  var statements_ifstatement = Blockly.JavaScript.statementToCode(block, 'ifStatement');
  var statements_elsestatement = Blockly.JavaScript.statementToCode(block, 'elseStatement');
  var light = 'highlightBlock("' + block.id + '");\n'
  var ifCondition = 'if (isPathFree("' + dropdown_pathfree + '")) {' + statements_ifstatement + '}';
  var elseCondition = 'else {' + statements_elsestatement + '}\n';
  var code = ifCondition + elseCondition;
  return code;
};

Blockly.JavaScript['anglecompare'] = function(block) {
  var dropdown_compare = block.getFieldValue('compare');
  var value_angle = Blockly.JavaScript.valueToCode(block, 'angle', Blockly.JavaScript.ORDER_ATOMIC);
  var code = '';
  var light = 'highlightBlock("' + block.id + '");\n'
  if (dropdown_compare === 'more') {
    code = ' > ';
  } else if (dropdown_compare === 'less') {
    code = ' < ';
  } else if (dropdown_compare === 'equal') {
    code = ' === ';
  } else if (dropdown_compare === 'unequal') {
    code = ' !== ';
  } else {
    code = ' !== ';
  }
  code = code + value_angle;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['angle'] = function(block) {
  var number_anglevalue = block.getFieldValue('angleValue');
  var code = number_anglevalue + ')';

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['if'] = function(block) {
  var value_ifbranch = Blockly.JavaScript.valueToCode(block, 'ifBranch', Blockly.JavaScript.ORDER_ATOMIC);
  var statements_ifstatement = Blockly.JavaScript.statementToCode(block, 'ifStatement');
  var light = 'highlightBlock("' + block.id + '");\n'
  var code = 'if (getAngle()' + value_ifbranch + '{' + statements_ifstatement + '}\n';
  return code;
};

Blockly.JavaScript['marker'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var light = 'highlightBlock("' + block.id + '");\n'
  var code = 'placeMark();\n';
  return code;
};

Blockly.JavaScript['markerexists'] = function(block) {
  var dropdown_markstatus = block.getFieldValue('markStatus');
  var statements_hasmarkstatement = Blockly.JavaScript.statementToCode(block, 'hasMarkStatement');
  var statements_nomarkstatement = Blockly.JavaScript.statementToCode(block, 'noMarkStatement');
  // TODO: Assemble JavaScript into code variable.
  var light = 'highlightBlock("' + block.id + '");\n'
  var code ='if (markPlaced()) {' + statements_hasmarkstatement + '} else {' + statements_nomarkstatement  +'}\n';
  return code;
};

