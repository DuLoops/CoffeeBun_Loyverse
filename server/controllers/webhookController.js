import express from 'express';
import { db } from '../firebase.js';
import { doc, setDoc, updateDoc, increment } from "firebase/firestore";
import { itemsData, specialItemsData, iBunModifiers, sBunModifiers } from '../itemsData.js';
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
        console.log(saleItems)
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
                        console.log(modifier)
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
            sales : sales,
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

export default router;
