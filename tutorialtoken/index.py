from flask import Flask, jsonify, request, render_template
from flask_jsglue import JSGlue
from ontology.account.account import Account
from ontology.crypto.signature_scheme import SignatureScheme
from ontology.exception.exception import SDKException

import tutorialtoken.default_settings

from ontology.ont_sdk import OntologySdk

app = Flask(__name__)
app.config.from_object('tutorialtoken.default_settings')
jsglue = JSGlue(app)

sdk = OntologySdk()
sdk.set_rpc(app.config['DEFAULT_REMOTE_RPC_ADDRESS'])
contract_address = '6fe70af535887a820a13cfbaff6b0b505f855e5c'
oep4 = sdk.neo_vm().oep4()
oep4.set_contract_address(contract_address)


@app.route('/change_net', methods=['POST'])
def change_net():
    network_selected = request.json.get('network_selected')[0]
    if network_selected == 'MainNet':
        remote_rpc_address = 'http://dappnode1.ont.io:20336'
        sdk.set_rpc(remote_rpc_address)
        sdk_rpc_address = sdk.get_rpc().addr
        if sdk_rpc_address != remote_rpc_address:
            result = ''.join(['remote rpc address set failed. the rpc address now used is ', sdk_rpc_address])
            return jsonify({'result': result}), 409
    elif network_selected == 'TestNet':
        remote_rpc_address = 'http://polaris3.ont.io:20336'
        sdk.set_rpc(remote_rpc_address)
        sdk_rpc_address = sdk.get_rpc().addr
        if sdk_rpc_address != remote_rpc_address:
            result = ''.join(['remote rpc address set failed. the rpc address now used is ', sdk_rpc_address])
            return jsonify({'result': result}), 409
    elif network_selected == 'Localhost':
        remote_rpc_address = 'http://localhost:20336'
        sdk.set_rpc(remote_rpc_address)
        old_remote_rpc_address = sdk.get_rpc()
        sdk_rpc_address = sdk.get_rpc().addr
        if sdk_rpc_address != remote_rpc_address:
            result = ''.join(['remote rpc address set failed. the rpc address now used is ', sdk_rpc_address])
            return jsonify({'result': result}), 409
        try:
            sdk.rpc.get_version()
        except SDKException as e:
            sdk.set_rpc(old_remote_rpc_address)
            error_msg = 'Other Error, ConnectionError'
            if error_msg in e.args[1]:
                return jsonify({'result': 'Connection to localhost node failed.'}), 400
            else:
                return jsonify({'result': e.args[1]}), 500
    else:
        return jsonify({'result': 'unsupported network.'}), 501
    return jsonify({'result': 'succeed'}), 200


@app.route('/getSmartContractEvent', methods=['POST'])
def get_smart_contract_event():
    tx_hash = request.json.get('tx_hash')
    event_info_select = request.json.get('event_info_select')
    event = sdk.rpc.get_smart_contract_event_by_tx_hash(tx_hash)
    try:
        result = event[event_info_select]
    except KeyError:
        result = ''
    return jsonify({'result': result}), 200


@app.route('/getName')
def get_name():
    name = oep4.get_name()
    return jsonify({'result': name}), 200


@app.route('/getSymbol')
def get_symbol():
    symbol = oep4.get_symbol()
    return jsonify({'result': symbol}), 200


@app.route('/getDecimal')
def get_decimal():
    decimal = oep4.get_decimal()
    return jsonify({'result': decimal}), 200


@app.route('/transfer', methods=['POST'])
def transfer():
    b58_to_address = request.json.get('b58_to_address')
    amount = int(request.json.get('amount'))
    private_key1 = '523c5fcf74823831756f0bcb3634234f10b3beb1c05595058534577752ad2d9f'
    from_acct = Account(private_key1, SignatureScheme.SHA256withECDSA)
    gas_limit = 20000000
    gas_price = 500
    result = oep4.transfer(from_acct, b58_to_address, amount, from_acct, gas_limit, gas_price)
    return jsonify({'result': result}), 200


@app.route('/allowance', methods=['POST'])
def allowance():
    b58_owner_address = request.json.get('b58_owner_address')
    b58_spender_address = request.json.get('b58_spender_address')
    result = oep4.allowance(b58_owner_address, b58_spender_address)
    return jsonify({'result': result}), 200


@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True, port=5001)
