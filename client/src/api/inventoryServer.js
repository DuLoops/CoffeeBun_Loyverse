const resetServer = async () => {
    try {  
        // Send reset call to the server
        const response = await fetch('https://coffeebun-inventory-b2a46451fe1f.herokuapp.com/api/reset-sales', {   
          method: 'POST',
        });
  
        if (response.ok) {
          console.log('Server reset call successful.');
        } else {
          console.error('Server reset call failed.');
        }
      } catch (error) {
        console.error('Error committing batch or sending reset call:', error);
      }
}

export { resetServer}