export function brainstreeDonate(clientToken, dotNetObject, amount, requireAddress = false) {
    // alert(clientToken);
    var button = document.querySelector('#submit-button');
    braintree.dropin.create({
        authorization: clientToken,
        selector: '#bt-dropin',
        applePay: {
            displayName: 'My Store',
            paymentRequest: {
                total: {
                    label: 'My Store',
                    amount: amount
                },
                if(requireAddress) {
                    // We recommend collecting billing address information, at minimum
                    // billing postal code, and passing that billing postal code with all
                    // Apple Pay transactions as a best practice.
                    requiredBillingContactFields: ["postalAddress"]
                }
            }
        },
        paypal: {
            //flow: 'fault',
            flow: 'checkout',
            amount: amount,
            currency: 'USD'
        },
        venmo: {}
    }, function (err, instance) {
        if (err) {
            // An error in the create call is likely due to
            // incorrect configuration values or network issues.
            // An appropriate error will be shown in the UI.
            alert(err);
            console.error(err);
            return;
        }
        button.addEventListener('click', function () {
            instance.requestPaymentMethod(function (requestPaymentMethodErr, payload) {
                if (requestPaymentMethodErr) {
                    // No payment method is available.
                    // An appropriate error will be shown in the UI.
                    alert(requestPaymentMethodErr);
                    console.error(requestPaymentMethodErr);
                    return;
                }
                dotNetObject.invokeMethodAsync('ProcessPayment', payload.nonce);
            });
        })
    });
}
