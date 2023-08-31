import express from 'express';
import { db } from '../firebase.js';
import { doc, setDoc, updateDoc, increment} from "firebase/firestore";
import { itemsData, specialItemsData, iBunModifiers, sBunModifiers } from '../itemsData.js';
import { deleteCollection } from '../api/firebaseAPI.js';
const router = express.Router();



// const saleData = req.body; 
// console.log("New Sale!")
// // console.log(saleData.receipts[0].line_items);
// const saleItems = saleData.receipts[0].line_items;
// saleItems.forEach(element => {
//   console.log(element.item_name + " " + element.quantity);
// })
// res.status(200).send('OK');

router.post('/loyverse-webhook', async (req, res) => {
    try {

        const receiptData = req.body.receipts[0];
        if (receiptData.receipt_type != 'SALE') return res.status(200).send('OK');
        const saleItems = receiptData.line_items;
        const sales = [];
        saleItems.forEach(element => {
            if (element.item_id in itemsData) {
                sales.push({
                    item: itemsData[element.item_id],
                    quantity: element.quantity,
                })
            } else if (element.item_id in specialItemsData) {
                if (element.line_modifiers.length == 0) {
                    sales.push({
                        item: specialItemsData[element.item_id],
                        quantity: element.quantity,
                    })
                } else {
                    for (const modifier of element.line_modifiers) {
                        if (modifier.name == 'I-Bun') {
                            sales.push({
                                item: iBunModifiers[modifier.modifier_option_id],
                                quantity: element.quantity,
                            })
                        } else if (modifier.name == 'S-Bun') {
                            sales.push({
                                item: sBunModifiers[modifier.modifier_option_id],
                                quantity: element.quantity,
                            })
                        }
                    }
                }
            }
        })
        if (sales.length === 0) return res.status(200).send('OK');

        console.log(sales)
        //Update bun quantities
        for (const element of sales) {
            await updateDoc(doc(db, "buns", element.item), {
                quantity: increment(-element.quantity)
            }).catch((error) => {
                console.error("Error updating bun document: ", error);
            }
            );
        }

        //Set sale doc
        const docData = {
            receipt_number: receiptData.receipt_number,
            receipt_type: receiptData.receipt_type,
            receipt_date: new Date(),
            sales: sales,
        }
        await setDoc(doc(db, "sales", docData.receipt_number + docData.receipt_date), docData).catch((error) => {
            console.error("Error adding sales document: ", error);
        });

        res.status(200).send('OK');
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/reset-sales', async (req, res) => {
    try {
        const dbRes = await deleteCollection(db, 'sales');

        const response = await fetch(process.env.LOYVERSE_WEBHOOK_URL + '/webhooks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.LOYVERSE_ACCESS_TOKEN}`, // Include the auth token here
            },
            json: true,
            body: JSON.stringify({
                id: process.env.LOYVERSE_WEBHOOK_ID,
                url: process.env.SERVER_URL + '/api/loyverse-webhook',
                type: 'receipts.update',
                status: 'ENABLED',
            }),
        });

        if (response.ok && dbRes) {
            res.sendStatus(200);
        } else {
            console.error('Server reset call failed.');
            res.sendStatus(500);
        }

    } catch (error) {
        console.error('Error sending reset call:', error);
        res.sendStatus(500);
    }
});
export default router;
