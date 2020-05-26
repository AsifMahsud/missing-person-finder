$(document).ready(function(){
	// Delete Function
	$('.delete-article').on('click', function(e){
		$target = $(e.target);
		const id = $target.attr('data-id');
		$.ajax({
			type: 'DELETE',
			url: '/articles/'+id,
			success: function(response){
				alert('Deleting Article');
				window.location.href = '/';
			},
			error: function(err){
				console.log(err);
			}
		});
	});
	// Image Preview
	let imagesPreview = function(input, placeToInsertImagePreview) {
          if (input.files) {
            let filesAmount = input.files.length;
            for (i = filesAmount-1; i < filesAmount; i++) {
              let reader = new FileReader();
              reader.onload = function(event) {
                //$($.parseHTML("<img>"))
                $("#Profile_Image")
                  .attr("src", event.target.result);
                  //.appendTo(placeToInsertImagePreview);
              };
              reader.readAsDataURL(input.files[i]);
            }
          }
        };
        $("#input-files").on("change", function() {
          imagesPreview(this, "div.preview-images");
        });

  $(document).ready(function() {
  $('li.active').removeClass('active');
  $('a[href="' + location.pathname + '"]').closest('li').addClass('active'); 
});
});