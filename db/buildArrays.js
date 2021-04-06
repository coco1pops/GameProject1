const fs = require('fs');

fs.readFile('./db.json', 'utf8', (err, data) => {

    if (err) {
        console.log(`Error reading file from disk: ${err}`);
    } else {

        // parse JSON string to JSON object
        const textAssets = JSON.parse(data);
        let _nPCResponse = [];
	let _nPCAction = [];
        
        textAssets.nPCResponse.forEach(function(item, index) {
          let _obj = {rset: item.rset,
                      responses: [item.Resp1, item.Resp2, item.Resp3]};
          _nPCResponse.push(_obj);
        });
        
        textAssets.nPCResponse = _nPCResponse;

	textAssets.nPCAction.forEach(function(item,index) {
		let _obj = {rset:item.rset,
			responses:[item.Resp1, item.Resp2, item.Resp3]};
		_nPCAction.push(_obj);
	});
	textAssets.nPCAction = _nPCAction;
        console.log(JSON.stringify(textAssets));
    }

});
