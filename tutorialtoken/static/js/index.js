new Vue({
    el: '#vue-app',
    data: function () {
        return {
            visible: false,
            privateKeyDialogVisible: false,
            hex_private_key: '1',
            eventInfoSelect: "",
            eventKey: "",
            inputTransferTo: "",
            inputTransferAmount: "",
            inputAllowanceOwner: "",
            inputAllowanceSpender: "",
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
            accountSelected: ''
        }
    },
    methods: {
        getAccounts(tab, event) {
            if (tab.label === 'DApp Settings') {
                let url = Flask.url_for('get_accounts');
                self = this;
                axios.get(url).then(function (response) {
                    self.accountOptions = [];
                    for (i = 0; i < response.data.result.length; i++) {
                        self.accountOptions.push({value: response.data.result[i], label: 'Account '.concat(i)});
                    }
                })
            }
        },
        accountChange(value) {
            let self = this;
            url = Flask.url_for('account_change');
            axios.post(url, {'b58_address_selected': value[0]}).then(function (response) {
                self.$message({
                    type: 'success',
                    message: response.data.result,
                    duration: 1200
                });
            }).catch(error => {
                self.$message({
                    message: error.response.data.result,
                    type: 'error',
                    duration: 2400
                })
            });
        },
        importAccount() {
            let self = this;
            self.$prompt('Paste your private key string here:', 'New Account', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                inputPattern: /^[a-zA-Z0-9]{64}$/,
                inputErrorMessage: 'Cannot import invalid private key'
            }).then(({value}) => {
                let url = Flask.url_for('import_account');
                axios.post(url, {
                    'hex_private_key': value
                }).then(function (response) {
                    let url = Flask.url_for('get_accounts');
                    axios.get(url).then(function (response) {
                        self.accountOptions = [];
                        for (i = 0; i < response.data.result.length; i++) {
                            self.accountOptions.push({value: response.data.result[i], label: 'Account '.concat(i)});
                        }
                    });
                    self.$message({
                        type: 'success',
                        message: 'Import successful',
                        duration: 1200
                    });
                }).catch(error => {
                    if (error.response.status === 409) {
                        self.$message({
                            message: error.response.data.result,
                            type: 'error',
                            duration: 2400
                        })
                    }
                });
            })
        },
        removeAccount() {
            console.log('removeAccount');
        },
        networkChange(value) {
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
            let url = Flask.url_for('change_net');
            let self = this;
            axios.post(url, {
                network_selected: self.networkSelected[0]
            }).then(function (response) {
                self.$notify({
                    title: 'Network Change',
                    type: 'success',
                    message: msg,
                    duration: 2000
                })
            }).catch(error => {
                if (error.response.status === 400) {
                    self.$notify({
                        title: 'Network Change',
                        type: 'warning',
                        message: error.response.data.result,
                        duration: 2000
                    })
                }
                else if (error.response.status === 409) {
                    self.$notify({
                        title: 'Network Change',
                        type: 'warning',
                        message: error.response.data.result,
                        duration: 2000
                    })
                }
                else if (error.response.status === 500) {
                    self.$notify({
                        title: 'Network Change',
                        type: 'warning',
                        message: error.response.data.result,
                        duration: 2000
                    })
                }
                else if (error.response.status === 501) {
                    self.$notify({
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
            });
        },
        queryEvent() {
            if (this.eventInfoSelect === "") {
                this.$notify({
                    title: 'Query Event Error',
                    type: 'warning',
                    message: 'Please select an event information you want to query.',
                    duration: 800
                })
            }
            else {
                let self = this;
                if (this.eventKey.length === 64) {
                    let url = Flask.url_for("get_smart_contract_event");
                    let self = this;
                    axios.post(url, {
                        tx_hash: self.eventKey,
                        event_info_select: self.eventInfoSelect
                    }).then(function (response) {
                        let result = response.data.result;
                        if (result.length === 0) {
                            self.$message({
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
                    })
                }
                else if (self.eventKey.length === 0) {
                    self.$notify({
                        title: 'TxHash Error',
                        type: 'error',
                        message: 'Please input TxHash',
                        duration: 800
                    })
                }
            }
        },
        getName() {
            let url = Flask.url_for("get_name");
            let self = this;
            axios.get(url).then(function (response) {
                let tokenName = response.data.result;
                self.$notify({
                    title: 'Token Name',
                    type: 'success',
                    message: tokenName,
                    duration: 0
                });
            })
        },
        getSymbol() {
            let url = Flask.url_for("get_symbol");
            let self = this;
            axios.get(url).then(function (response) {
                let tokenSymbol = response.data.result;
                self.$notify({
                    title: 'Token Symbol',
                    type: 'success',
                    message: tokenSymbol,
                    duration: 0
                })
            })
        },
        getDecimal() {
            let url = Flask.url_for("get_decimal");
            let self = this;
            axios.get(url).then(function (response) {
                if (response.status === 200) {
                    let tokenSymbol = response.data.result;
                    self.$notify({
                        title: "Token Decimals",
                        type: 'success',
                        message: tokenSymbol,
                        duration: 0
                    })
                }
                else {
                    self.$notify({
                        title: "Token Decimals",
                        type: 'error',
                        message: 'query token decimals failed',
                        duration: 0
                    })
                }
            })
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
        allowance() {
            let url = Flask.url_for("allowance");
            let self = this;
            if (self.inputAllowanceOwner.length === 34 && self.inputAllowanceSpender.length === 34) {
                axios.post(url, {
                    b58_owner_address: self.inputAllowanceOwner,
                    b58_spender_address: self.inputAllowanceSpender
                }).then(function (response) {
                    if (response.status === 200) {
                        self.$notify({
                            title: 'Allowance',
                            type: 'success',
                            message: response.data.result,
                            duration: 0
                        });
                    }
                    else {
                        self.$notify({
                            title: 'Allowance',
                            type: 'error',
                            message: 'query allowance failed',
                            duration: 1200
                        });
                    }
                })
            }
            else if (self.inputAllowanceSpender.length === 0) {
                self.$notify({
                    title: 'Allowance Error',
                    type: 'error',
                    message: 'Please input the spender address',
                    duration: 1200
                })
            }
            else if (self.inputAllowanceOwner.length === 0) {
                self.$notify({
                    title: 'Allowance Error',
                    type: 'error',
                    message: 'Please input the owner address',
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
        approve() {
            console.log('TODO');
        },
        createAccount() {
            let self = this;
            let url = Flask.url_for('create_account');
            axios.get(url).then(function (response) {
                let b58_address = response.data.b58_address;
                let hex_private_key = response.data.hex_private_key;
                self.privateKeyDialogVisible = true;
                // self.$alert('private key:\n'.concat(hex_private_key), 'Create successful', {
                //     confirmButtonText: 'OK',
                //     type:'success',
                //     center: true
                // });
                $("#hex_private_key").val(hex_private_key);
            });
        }
    }
});