# ontology-tutorialtoken

## Unboxing the Dapp

1. Install Ontology Dapp Box.

```bash
pip install OBox
```

2. Install ontology-python-sdk

```bash
pip install ontology-python-sdk
```

3. Download the box. This also takes care of installing the necessary dependencies.

```bash
OBox --install tutorialtoken
```

## Creating the "oep4_token" smart contract

With our front-end taken care of, we can focus on the `oep4_token` contract.

1. In the `contracts/` directory of your `OBox`, create the file `oep4_token.py` and add the following contents:

```python
from boa.interop.System.Storage import GetContext, Get, Put, Delete
from boa.interop.System.Runtime import Notify, CheckWitness
from boa.builtins import concat, ToScriptHash

ctx = GetContext()
```

2. To set our own parameters for the token, we'll be declaring our own name, symbol, and other details. Add the following content block to the contract (between the curly braces):

```python
NAME = 'DXToken'
SYMBOL = 'DX'
DECIMAL = 8
FACTOR = 100000000
OWNER = ToScriptHash("AUQ2cqRs2daQBqTFs6Zun8eYXRe4a9JZUC")
TOTAL_AMOUNT = 1000000000
```

