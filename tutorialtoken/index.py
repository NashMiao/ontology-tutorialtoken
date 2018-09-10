from flask import Flask
from flask import jsonify
from flask_jsglue import JSGlue
from flask import render_template

from ontology.ont_sdk import OntologySdk

app = Flask(__name__)
jsglue = JSGlue(app)

remote_rpc_address = "http://polaris3.ont.io:20336"
sdk = OntologySdk()
sdk.set_rpc(remote_rpc_address)


@app.route('/getName')
def get_name():
    contract_address = '6fe70af535887a820a13cfbaff6b0b505f855e5c'
    oep4 = sdk.neo_vm().oep4()
    oep4.set_contract_address(contract_address)
    name = oep4.get_name()
    return jsonify({'results': name}), 200


@app.route("/")
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True)
