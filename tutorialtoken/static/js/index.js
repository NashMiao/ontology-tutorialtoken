new Vue({
    el: '#vue-app',
    data: function () {
        return {
            visible: false,
            privateKeyDialogVisible: false,
            newHexPrivateKey: '',
            eventInfoSelect: '',
            eventKey: '',
            inputTransferTo: '',
            inputTransferAmount: '',
            inputAllowanceOwner: '',
            inputAllowanceSpender: '',
            labelPosition: 'right',
            isSwitchToSettings: true,
            settingForm: {
                networkOptions: [{
                    value: 'MainNet',
                    label: 'Main Network',
                }, {
                    value: 'TestNet',
                    label: 'Polaris Test Network'
                }, {
                    value: 'Localhost',
                    label: 'Localhost 20336'
                }],
                networkSelected: ['TestNet'],
                accountOptions: [],
                accountSelected: [],
                b58AddressSelected: ''
            },
            multiTransferForm: {
                toAddressArray: [{
                    value: ''
                }],
                fromAddressArray: [{
                    value: ''
                }],
                amountArray: [{
                    value: ''
                }]
            },
        }
    },
    methods: {
        async submitForm(formName) {
            if (formName === "multiTransferForm") {
                let valid = await this.$refs[formName].validate();
                if (valid) {
                    let from = this.multiTransferForm.fromAddressArray;
                    let to = this.multiTransferForm.toAddressArray;
                    let amount = this.multiTransferForm.amountArray;
                    if (from.length !== to.length || from.length !== amount.length) {
                        this.$message({
                            message: 'Input mistake',
                            type: 'error',
                            duration: 2400
                        });
                        return
                    }
                    let transfer_array = [];
                    for (index in this.multiTransferForm.fromAddressArray) {
                        let transfer = [from[index], to[index].value, Number(amount[index].value)];
                        transfer_array.push(transfer);
                    }
                    try {
                        let transfer_multi_url = Flask.url_for('transfer_multi');
                        let response = await axios.post(transfer_multi_url, {
                            'transfer_array': JSON.stringify(transfer_array)
                        });
                        let tx_hash = response.data.result;
                        if (tx_hash.length === 64) {
                            this.$message({
                                type: 'success',
                                message: 'Transfer successfully： '.concat(tx_hash).concat('!'),
                                duration: 2000
                            });
                        }
                        else {
                            this.$message({
                                type: 'error',
                                message: 'Transfer failed!',
                                duration: 800
                            });
                        }
                    }
                    catch (error) {
                        console.log(error);
                    }
                } else {
                    console.log('error submit!!');
                }
            }
        },
        resetMultiTransferForm(formName) {
            this.$refs[formName].resetFields();
        },
        removeTransfer(item) {
            let index = this.multiTransferForm.amountArray.indexOf(item);
            if (this.multiTransferForm.amountArray.length === 1) {
                return
            }
            if (index !== -1) {
                this.multiTransferForm.fromAddressArray.splice(index, 1);
                this.multiTransferForm.toAddressArray.splice(index, 1);
                this.multiTransferForm.amountArray.splice(index, 1);
            }
        },
        addTransfer() {
            let now_time = Date.now();
            this.multiTransferForm.fromAddressArray.push({
                value: '',
                key: now_time
            });
            this.multiTransferForm.toAddressArray.push({
                value: '',
                key: now_time
            });
            this.multiTransferForm.amountArray.push({
                value: '',
                key: now_time
            });
        },
        async getName() {
            let url = Flask.url_for("get_name");
            let response = await axios.get(url);
            this.$notify({
                title: 'Token Name',
                type: 'success',
                message: response.data.result,
                duration: 0
            });
        },
        async getSymbol() {
            let url = Flask.url_for("get_symbol");
            let response = await axios.get(url);
            this.$notify({
                title: 'Token Symbol',
                type: 'success',
                message: response.data.result,
                duration: 0
            })
        },
        async getDecimal() {
            let url = Flask.url_for("get_decimal");
            try {
                let response = await axios.get(url);
                this.$notify({
                    title: "Token Decimals",
                    type: 'success',
                    message: response.data.result,
                    duration: 0
                })
            } catch (error) {
                this.$notify({
                    title: "Token Decimals",
                    type: 'error',
                    message: 'query token decimals failed',
                    duration: 0
                })
            }
        },
        async getAccounts() {
            let url = Flask.url_for('get_accounts');
            let response = await axios.get(url);
            this.settingForm.accountOptions = [];
            for (i = 0; i < response.data.result.length; i++) {
                this.settingForm.accountOptions.push({
                    value: response.data.result[i].b58_address,
                    label: response.data.result[i].label
                });
            }
        },
        async tabClickHandler(tab, event) {
            if (tab.label === 'DApp Settings') {
                if (this.isSwitchToSettings === true) {
                    await this.getAccounts();
                    this.isSwitchToSettings = false;
                    if (this.settingForm.accountSelected.length === 0 && this.settingForm.accountOptions.length !== 0) {
                        let firstB58Address = this.settingForm.accountOptions[0].value;
                        this.settingForm.accountSelected = [firstB58Address];
                        this.settingForm.b58AddressSelected = firstB58Address;
                    }
                }
            }
            else if (tab.label === 'Token TransferMulti') {
                this.isSwitchToSettings = true;
                await this.getAccounts();
            }
            else {
                this.isSwitchToSettings = true;
            }
        },
        async accountChange(value) {
            try {
                let url = Flask.url_for('account_change');
                let response = await axios.post(url, {'b58_address_selected': value[0]});
                this.settingForm.b58AddressSelected = value[0];
                this.$message({
                    type: 'success',
                    message: response.data.result,
                    duration: 1200
                });
            }
            catch (error) {
                this.$message({
                    message: error.response.data.result,
                    type: 'error',
                    duration: 2400
                })
            }
        },
        async importAccount() {
            let hex_private_key = await this.$prompt('Paste your private key string here:', 'Import Account', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                inputPattern: /^[a-zA-Z0-9]{64}$/,
                inputErrorMessage: 'Cannot import invalid private key'
            }).catch(() => {
                this.$message.warning('Import canceled');
            });
            if (hex_private_key === undefined) {
                return;
            }
            let label = await this.$prompt('Account Label:', 'Import Account', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel'
            }).catch(() => {
                this.$message.warning('Import canceled');
            });
            if (label === undefined) {
                return;
            }
            let password = await this.$prompt('Account Password', 'Import Account', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel'
            }).catch(() => {
                this.$message.warning('Import canceled');
            });
            if (password === undefined) {
                return;
            }
            try {
                let import_account_url = Flask.url_for('import_account');
                let import_account_response = await axios.post(import_account_url, {
                    'hex_private_key': hex_private_key.value,
                    'label': label.value,
                    'password': password.value
                });
                await this.getAccounts();
                this.$message.success({
                    message: 'Import successful',
                    duration: 1200
                });
            }
            catch (error) {
                console.log(error);
                // if (error.response.status === 409) {
                //     this.$message({
                //         message: error.response.data.result,
                //         type: 'error',
                //         duration: 2400
                //     })
                // }
            }
        },
        async removeAccount() {
            let password = await this.$prompt('Account Password', 'Remove Default Account', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel'
            }).catch(() => {
                this.$message.warning('Import canceled');
            });
            if (password === undefined) {
                return;
            }
            console.log("TODO");
        },
        async networkChange(value) {
            let msg = '';
            if (value[0] === 'MainNet') {
                msg = 'Connecting to Main Network'
            }
            else if (value[0] === 'TestNet') {
                msg = 'Connecting to Polaris Test Network'
            }
            else if (value[0] === 'Localhost') {
                msg = 'Connecting to Localhost'
            }
            else {
                return
            }
            let change_net_url = Flask.url_for('change_net');
            try {
                let response = await axios.post(change_net_url, {
                    network_selected: value[0]
                });
                this.$notify({
                    title: 'Network Change',
                    type: 'success',
                    message: msg,
                    duration: 2000
                });
            } catch (error) {
                this.settingForm.networkSelected = ['TestNet'];
                if (error.response.status === 400) {
                    this.$notify({
                        title: 'Network Change',
                        type: 'warning',
                        message: error.response.data.result,
                        duration: 2000
                    })
                }
                else if (error.response.status === 409) {
                    this.$notify({
                        title: 'Network Change',
                        type: 'warning',
                        message: error.response.data.result,
                        duration: 2000
                    })
                }
                else if (error.response.status === 500) {
                    this.$notify({
                        title: 'Network Change',
                        type: 'warning',
                        message: error.response.data.result,
                        duration: 2000
                    })
                }
                else if (error.response.status === 501) {
                    this.$notify({
                        title: 'Network Change',
                        type: 'warning',
                        message: error.response.data.result,
                        duration: 2000
                    })
                }
                else {
                    this.$notify({
                        title: 'Network Change',
                        type: 'error',
                        message: 'Failed',
                        duration: 2000
                    })
                }
            }
        },
        transfer() {
            let url = Flask.url_for("transfer");
            let self = this;
            if (self.inputTransferTo.length === 34) {
                if (self.inputTransferAmount > 0) {
                    self.$confirm('This will transfer token. Continue?', 'Warning', {
                        confirmButtonText: 'Confirm',
                        cancelButtonText: 'Cancel',
                        type: 'warning',
                        duration: 0
                    }).then(() => {
                            axios.post(url, {
                                b58_to_address: self.inputTransferTo,
                                amount: self.inputTransferAmount
                            }).then(function (response) {
                                let tx_hash = response.data.result;
                                if (tx_hash.length === 64) {
                                    self.$message({
                                        type: 'success',
                                        message: 'Transfer successfully： '.concat(tx_hash).concat('!'),
                                        duration: 2000
                                    });
                                }
                                else {
                                    self.$message({
                                        type: 'error',
                                        message: 'Transfer failed!',
                                        duration: 800
                                    });
                                }
                            }).catch(error => {
                                if (error.response.status === 400) {
                                    self.$notify({
                                        title: ''
                                    })
                                }
                            });
                        }
                    ).catch(() => {
                        self.$message({
                            message: '已取消转账',
                            type: 'warning',
                            duration: 800
                        });
                    });
                }
                else if (self.inputTransferAmount === 0) {
                    self.$notify({
                        title: "Amount Error",
                        type: 'warning',
                        message: "Please input the amount value great than 0.",
                        duration: 800
                    })
                }
                else {
                    self.$notify({
                        title: "Amount Error",
                        type: 'warning',
                        message: "Please input the correct amount value.",
                        duration: 800
                    })
                }
            }
            else if (self.inputTransferTo.length === 0) {
                self.$notify({
                    title: "Transfer Error",
                    type: 'error',
                    message: "Please input the address.",
                    duration: 1200
                })
            }
            else {
                self.$notify({
                    title: "Transfer Error",
                    type: 'error',
                    message: "Please input the correct base58 encode address.",
                    duration: 1200
                })
            }
        },
        async allowance() {
            if (this.inputAllowanceSpender.length === 0) {
                this.$notify({
                    title: 'Allowance Error',
                    type: 'error',
                    message: 'Please input the spender address',
                    duration: 1200
                });
                return;
            }
            if (this.inputAllowanceOwner.length === 0) {
                this.$notify({
                    title: 'Allowance Error',
                    type: 'error',
                    message: 'Please input the owner address',
                    duration: 1200
                });
                return;
            }
            if (this.inputAllowanceOwner.length === 34 && this.inputAllowanceSpender.length === 34) {
                try {
                    let url = Flask.url_for("allowance");
                    let response = await axios.post(url, {
                        b58_owner_address: self.inputAllowanceOwner,
                        b58_spender_address: self.inputAllowanceSpender
                    });
                    this.$notify({
                        title: 'Allowance',
                        type: 'success',
                        message: response.data.result,
                        duration: 0
                    });
                } catch (error) {
                    this.$notify({
                        title: 'Allowance',
                        type: 'error',
                        message: 'query allowance failed',
                        duration: 1200
                    });
                }
            }
            else {
                this.$notify({
                    title: "Transfer Error",
                    type: 'error',
                    message: "Please input the correct base58 encode address.",
                    duration: 1200
                });
            }
        },
        approve() {
            console.log('TODO');
        },
        async createAccount() {
            let label = await this.$prompt('Account Label:', 'Import Account', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel'
            }).catch(() => {
                this.$message.warning('Import canceled');
            });
            if (label === undefined) {
                return;
            }
            let password = await this.$prompt('Account Password', 'Import Account', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel'
            }).catch(() => {
                this.$message.warning('Import canceled');
            });
            if (password === undefined) {
                return;
            }
            try {
                let create_account_url = Flask.url_for('create_account');
                let response = await axios.post(create_account_url, {
                    'label': label.value,
                    'password': password.value
                });
                this.newHexPrivateKey = response.data.hex_private_key;
                this.privateKeyDialogVisible = true;
                await this.getAccounts();
            } catch (error) {
                console.log(error);
            }
        },
        async queryEvent() {
            if (this.eventInfoSelect === "") {
                this.$notify({
                    title: 'Query Event Error',
                    type: 'warning',
                    message: 'Please select an event information you want to query.',
                    duration: 800
                });
                return;
            }
            if (this.eventKey.length === 0) {
                self.$notify({
                    title: 'TxHash Error',
                    type: 'error',
                    message: 'Please input TxHash',
                    duration: 800
                });
                return;
            }
            if (this.eventKey.length === 64) {
                let get_smart_contract_event_url = Flask.url_for("get_smart_contract_event");
                let response = await axios.post(get_smart_contract_event_url, {
                    tx_hash: self.eventKey,
                    event_info_select: self.eventInfoSelect
                });
                let result = response.data.result;
                if (result.length === 0) {
                    this.$message({
                        message: 'query failed!',
                        type: 'error',
                        duration: 800
                    })
                }
                else {
                    if (self.eventInfoSelect === 'Notify') {
                        self.$alert(result, 'Query Result', {
                            confirmButtonText: 'OK',
                        })
                    } else {
                        self.$notify({
                            title: 'Query Result',
                            type: 'succeed',
                            message: result,
                            duration: 0
                        })
                    }
                }
            }
        },
    }
});
