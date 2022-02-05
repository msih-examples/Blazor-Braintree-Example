export function brainstreeDonate(clientToken, dotNetObject, amount, requireAddress = false) {

    var button = document.querySelector('#submit-button');
    var input = document.querySelector('#Amount');

    braintree.dropin.create({
        authorization: clientToken,
        selector: '#bt-dropin',
        applePay: {
            displayName: 'My Store',
            paymentRequest: {
                total: {
                    label: 'My Store',
                    amount: input.value
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
            amount: input.value,
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
                // call C# method ProcessPayment
                dotNetObject.invokeMethodAsync('ProcessPayment', payload.nonce, input.value);
            });
        });

        function callback(mutationList, observer) {
            mutationList.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isHidden = mutation.target.classList.contains('braintree-hidden');
                    if (isHidden) {
                        // Choose another way to pay is clicked on and is hidden
                        dotNetObject.invokeMethodAsync('ClearTransationResults');
                        button.setAttribute('disabled', true);
                    }
                }
            });
        }

        const observer = new MutationObserver(callback)

        var ChooseAnotherWayToPay = document.querySelector("[data-braintree-id='toggle']");
        const options = {
            attributes: true
        }

        observer.observe(ChooseAnotherWayToPay, options)


        input.addEventListener('blur', function () {
            // when amount input field changes
            console.error("update payment amount");
            dotNetObject.invokeMethodAsync('ClearTransationResults');
            instance.clearSelectedPaymentMethod(); // clear payment selection
            instance.updateConfiguration('paypal', 'amount', input.value); // update amount for paypal
            //instance.updateConfiguration('applePay', 'amount', input.value); // update amount for paypal
            instance.updateConfiguration('applePay', 'paymentRequest', {
                total: {
                    label: 'My Store',
                    amount: input.value
                }
            });
        });

        instance.on('paymentMethodRequestable', function (event) {
            // https://braintree.github.io/braintree-web-drop-in/docs/current/Dropin.html#on-examples
            //  A property to determine if a payment method is currently selected when the payment method becomes requestable.
            //  This will be`true` any time a payment method is visibly selected in the Drop -in UI, such as when PayPal authentication completes or a stored payment method is selected.
            button.removeAttribute('disabled');
        });

        instance.on('noPaymentMethodRequestable', function () {
            // This event is emitted when there is no payment method available in Drop-in.
            button.setAttribute('disabled', true);
            instance.clearSelectedPaymentMethod(); // clear payment selection
        });
    });
}
