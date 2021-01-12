/*right sidebar contents wrapper*/
"use strict";

/*
파일명: projectMainChat.js
설명: 채팅방 기능 구현
작성일: 2021-01-10
디자인: 전선규
기능구현: 도재구
*/

$(document).ready(function(){
	
	var modal = document.getElementById('crtChat-modal')
	var crtChatBtn = document.getElementById('crtChatBtn');
	var crtChatCancelBtn = document.getElementById('crtChat-btn-cancel');
	var crtChatCreatedBtn = document.getElementById('crtChat-btn-created');
	var crtChatBackground = document.getElementById('crtChat-modal-background');
	var chatSearchBox = document.getElementById('chat-search-box');
	
	// +채팅방 생성하기 버튼 클릭시
	crtChatBtn.onclick = () => {
		$('#Selected-List').empty();
		$('#chat-search-box').val('');
		$('#crtChat-search-box').val('');
		modal.style.display = 'block';
		crtChatBackground.style.display = 'block';
		
		$.ajax(
			{
				type : "GET",
				url  : "chat/members?sessionEmail="+$('#session_email').val(),
				async: false,
				success : function(data){
					userList(data);
				}
			}
		);
		//인원을 선택하지 않았을 경우 '채팅방 생성하기' 버튼 비활성화
		if($('#Selected-List').is(':empty')){
			$('.crtChat-btn-created').attr('class','crtChat-btn-created-not');
		}
		
		//웹소켓 - ON/OFF 상태 알림등 구현
		logonSocket.send('');
		
	}
	
	//ESC 키 입력 시
	window.onkeydown = function(event){
		if(modal.style.display == 'block' && crtChatBackground.style.display == 'block'){
			if (event.keyCode == 27 || event.which == 27) {
				modal.style.display = 'none';
				crtChatBackground.style.display = 'none';
			}
		}
	}
	
	// 채팅생성창에서 취소버튼을 눌렀을 떄
	crtChatCancelBtn.onclick = () => {
		modal.style.display = 'none';
		crtChatBackground.style.display = 'none';
	}
	
	// 채팅생성창에서 생성하기 버튼을 눌렀을 때
	crtChatCreatedBtn.onclick = () => {
		if(!$('#Selected-List').is(':empty')){
			modal.style.display = 'none';
			crtChatBackground.style.display = 'none';
			
			let div_length = $('#Selected-List').find('div').length;
			let user_array = [];
			for(let i=1; i <= div_length / 6; i++){
				let j = i * 6 - 2;
				let div = $('#Selected-List').find('div:eq('+j+')').text();
				user_array.push(div);
			}
			user_array.push($('#session_email').val());
			
			$.ajax(
					{
						type 		: "POST",
						url  		: "chat/members",
						traditional : true,
						data 		: {
							'user_array' : user_array
						},
						dataType	: "json",
						success 	: function(data){
							completeChattingRoom(data);
						},
						error		: function(request,status,error){
							alert(error);
						}
					}
			);
		}
		let today = new Date();
		var alram = {
			email:$("#session_email").val(),
			nick:$("#nickname").val(),
			title:"채팅방",
			state:"생성",
			alramTime: moment(today).format('YYYY-MM-DD'+" "+'HH:mm'),
			project_seq:$("#projectNum").val(),
		}
		socket.send(JSON.stringify(alram))
	}
	
	
	crtChatBackground.onclick = () => {
		// 채팅방 생성창에서 blur된 화면을 클릭했을때
		if(event.target == crtChatBackground) {
			modal.style.display = 'none';
			crtChatBackground.style.display = 'none';
			
			// 채팅방리스트를 띄워주는 함수
			$.ajax(
				{
					type 		: "GET",
					url  		: "chat/room/list",
					success 	: function(data){
						console.log(data);
						chattingRoomList(data);
					},
					error		: function(request,status,error){
						alert(error);
					}
				}
			);
		}
	}
	
	//채팅방 비동기 검색기능
	$('#chat-search-box').keyup( () => {
		$.ajax(
			{
				type : "post",
				url  : "chat/room",
				data : { 'searchKeyword' : $('#chat-search-box').val()},
				success : function(data){
					console.log(data);
					chattingRoomList(data);
				},
				error: function(request,status,error){
					alert(error);
				}
			}
		);
	});
	
	//채팅방 생성창 팀원 비동기 검색기능
	$('#crtChat-search-box').keyup( () => {
		//검색시 선택된 유저가 없으면
		if($('#Selected-List').html() == ''){
			$.ajax(
				{
					type : "GET",
					url  : "chat/members/search?sessionEmail="+$('#session_email').val(),
					data : { 'nickName' : $('#crtChat-search-box').val()},
					success : function(data){
						userList(data);
					},
					error: function(request,status,error){
						alert(error);
					}
				}
			);
		
		//검색시 선택된 유저가 한명이라도 있으면	
		}else{
			let div_length = $('#Selected-List').find('div').length;
			let user_array = [];
			for(let i=1; i <= div_length / 6; i++){
				let j = i * 6 - 2;
				let div = $('#Selected-List').find('div:eq('+j+')').text();
				user_array.push(div);
			}
			console.log('user_array');
			console.log(user_array);
			
			$.ajax(
				{
					type 		: "POST",
					url  		: "chat/members/search?sessionEmail="+$('#session_email').val(),
					data 		: {
						'nickName' : $('#crtChat-search-box').val(),
						'user_array' : user_array
					},
					traditional : true,
					success 	: function(data){
						console.log(data);
						userList(data);
					},
					error		: function(request,status,error){
						alert(error);
					}
				}
			);
		}

	});
	
	
});

/*
파일명: projectMainChat.js
설명: 채팅생성창에서 회원 ON/OFF 상태 확인
작성일: 2021-01-12
작성자: 도재구
*/
function logonUser(data){
	//유저리스트의 데이터
	let div_length = $('#Chatting-UserList').find('div').length;
	for(let j=1; j <= div_length / 9; j++){
		let k = j * 9 - 2;
		let div = $('#Chatting-UserList').find('div:eq('+k+')').text();
		let index = j-1;
		$('#crtChat-select-user-on-'+index).css('visibility','hidden');
		//방금 서버에서 가져온 데이터
		for(let i=0; i < data.length; i++){
			if(data[i] == div){
				$('#crtChat-select-user-on-'+index).css('visibility','visible');
			}	
		}
	}
}

/*
파일명: projectMainChat.js
설명: 대화할 채팅방 오픈
작성일: 2021-01-06
작성자: 도재구
*/
function popupOpen(roomno,roomname){
	let popUrl = "chat/open?select="+roomno+"&roomname="+roomname;
	let popOption = "width=370, height=700, toolbar=no, menubar=no, resizable=no, scrollbars=no, status=no;";
	window.open(popUrl, "", popOption);
	
}

/*
파일명: projectSidebar.js 에서 ajax 성공 시 실행되는 함수
설명: 우측사이드바에 채팅방리스트를 비동기로 띄움
작성일: 2020-12-31
작성자: 도재구
*/
function chattingRoomList(data){
	"use strict";
	$('#chat-list').empty();
	let opr = "";
	$.each(data.chat_room_list,function(index,elem){
		//프로젝트 제목
		let chat_title = elem.chatting_room_name;
		let chat_title_substr = "";
		if(chat_title.length > 15){
			chat_title_substr = chat_title.substr(0,15) + "...";
		}else{
			chat_title_substr = chat_title;
		}
		
		opr += 	"<div id='chat-list-wrapper-"+elem.chatting_room_seq+"' class='chat-list-wrapper'>"+
					"<div class='chat-list-alarm'>1</div>"+
					"<div class='chat-list-img'>"+
						"<i class='fas fa-th-large'></i>"+
					"</div>"+
					"<div class='chat-list-letter-wrapper'>"+
						"<div id='chat-list-letter-title-"+elem.chatting_room_seq+"' class='chat-list-letter-title'>"+
							"<a id='chat-list-letter-a"+elem.chatting_room_seq+"' href='javascript:popupOpen("+elem.chatting_room_seq+",\""+chat_title_substr+"\");' class='chat-list-letter-a'>"+
								chat_title_substr+
							"</a>"+
						"</div>"+
						"<div id='chat-list-letter-members-"+elem.chatting_room_seq+"' class='chat-list-letter-members'>"+data.nicknames[index]+"</div>"+
					"</div>"+
					"<div id='chat-list-update-"+elem.chatting_room_seq+"' class='chat-list-update'>"+
						"<i onclick='updateChatRoomName(this)' class='fas fa-pencil-alt'></i>"+
					"</div>"+
					"<div id='chat-list-cancel-"+elem.chatting_room_seq+"' class='chat-list-cancel'>"+
						"<i onclick='deleteChatRoom(this)' class='fas fa-times'></i>"+
					"</div>"+
				"</div>";
	});
	$('#chat-list').append(opr);
	

}

/*
파일명: projectMainChat.js
설명: 채팅방 생성시 채팅방리스트에 생성된 것을 반영하여 새로 리스트에 띄움
작성일: 2020-12-31
작성자: 도재구
*/
function completeChattingRoom(data){
	"use strict";
	$('#chat-list').empty();
	let opr = "";
	$.each(data.chat_room_list,function(index,elem){
		//프로젝트 제목
		let chat_title = elem.chatting_room_name;
		let chat_title_substr = "";
		if(chat_title.length > 15){
			chat_title_substr = chat_title.substr(0,15) + "...";
		}else{
			chat_title_substr = chat_title;
		}

		opr += "<div id='chat-list-wrapper-"+elem.chatting_room_seq+"' class='chat-list-wrapper'>"+
					"<div class='chat-list-img'>"+
						"<i class='fas fa-th-large'></i>"+
					"</div>"+
					"<div id='chat-list-letter-wrapper-"+elem.chatting_room_seq+"' class='chat-list-letter-wrapper'>"+
						"<div id='chat-list-letter-title-"+elem.chatting_room_seq+"' class='chat-list-letter-title'>"+
							"<a id='chat-list-letter-a"+elem.chatting_room_seq+"' href='javascript:popupOpen("+elem.chatting_room_seq+",\""+chat_title_substr+"\");' class='chat-list-letter-a'>"+
								chat_title_substr+
							"</a>"+
						"</div>"+
						"<div id='chat-list-letter-members-"+elem.chatting_room_seq+"' class='chat-list-letter-members'>"+data.nicknames[index]+"</div>"+
					"</div>"+
					"<div id='chat-list-update-"+elem.chatting_room_seq+"' class='chat-list-update'>"+
						"<i onclick='updateChatRoomName(this)' class='fas fa-pencil-alt'></i>"+
					"</div>"+					
					"<div id='chat-list-cancel-"+elem.chatting_room_seq+"' class='chat-list-cancel'>"+
						"<i onclick='deleteChatRoom(this)' class='fas fa-times'></i>"+
					"</div>"+
				"</div>";
	});
	$('#chat-list').append(opr);
}

/*
파일명: projectMainChat.js
설명: 채팅방 리스트에서 채팅방을 삭제합니다.
작성일: 2020-12-31
작성자: 도재구
*/
function deleteChatRoom(me){
	"use strict";
	swal.fire({
			text: '채팅방을 목록에서 숨기시겠습니까?',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: '확인',
			cancelButtonText: '취소',
			
		}).then((result) => {
			
			if(result.isConfirmed){
				let div = $(me).closest('div');
				let div_attr = div.attr("id");
				let div_index = div_attr.lastIndexOf("-")+1;
				let div_substr = div_attr.substring(div_index);
				
				console.log("div_substr");
				console.log(div_substr);
				
				$('#chat-list-wrapper-'+div_substr).remove();
				
				$.ajax(
						{
							type 		: "POST",
							url  		: "chat/room/list",
							data 		: {
								'chatting_room_seq' : div_substr
							},
							success 	: function(data){
								console.log(data);
								
							},
							error		: function(request,status,error){
								alert(error);
							}
						}
				);//ajax end
				
				swal.fire({
					text: '동일인원과의 채팅기록은 저장됩니다',
					icon: 'success',
					confirmButtonColor: '#3085d6',
					confirmButtonText: '확인',
				})
				
			}//if(result.isConfirmed) end

		});
	
}

/*
파일명: projectMainChat.js
설명: 채팅방 이름을 수정하기 위해 input태그를 띄워줍니다.
작성일: 2020-12-31
작성자: 도재구
*/
function updateChatRoomName(me){
	"use strict";
	//index 값 추출
	let div = $(me).closest('div');
	let div_attr = div.attr("id");
	let div_index = div_attr.lastIndexOf("-")+1;
	let div_substr = div_attr.substring(div_index);
	
	//프로젝트명 div, 아이콘 div 하위요소 비우기
	let chat_room_title = $('#chat-list-letter-title-'+div_substr);
	let chat_room_update = $('#chat-list-update-'+div_substr);
	
	//새로운 요소로 대체
	let input_tag = "<input id='chat-list-letter-title-input-"+div_substr+"' value='"+chat_room_title.text()+"' onfocus='this.select()' type='text' size=12>";
	let check_button = "<i id='fas-fa-check-"+div_substr+"' onclick='updateNameOk(this)' class='fas fa-check'></i>";
	
	chat_room_title.empty();
	chat_room_update.empty();
	chat_room_title.append(input_tag);
	chat_room_update.append(check_button);
	
	$('#chat-list-letter-title-input-'+div_substr).focus();
	
	//엔터치면 수정기능 적용합니다.
	$('#chat-list-letter-title-input-'+div_substr).keydown( (event) => {
		if (event.which == 13) {
			event.preventDefault();
			updateNameOk($('#fas-fa-check-'+div_substr));
		}
	});
	
	$('#chat-list-letter-a'+div_substr).click( () => {return false});
}

/*
파일명: projectMainChat.js
설명: 채팅방 이름을 수정합니다.
작성일: 2020-12-31
작성자: 도재구
*/
function updateNameOk(me){
	"use strict";
	let div = $(me).closest('div');
	let div_attr = div.attr("id");
	let div_index = div_attr.lastIndexOf("-")+1;
	let div_substr = div_attr.substring(div_index);

	let chat_room_input = $('#chat-list-letter-title-input-'+div_substr);
	let chat_room_title = $('#chat-list-letter-title-'+div_substr);
	
	console.log("chat_room_input.attr('value')");
	console.log(chat_room_input.attr("value"));
	
	//input 태그에 값이 입력되어 있으면 그 값으로 수정함
	if(chat_room_input.val() != ''){
		if (chat_room_input.val().length > 15) {
			swal.fire({
				text: '15자 이하로 입력해주세요',
				icon: 'warning',
				confirmButtonColor: '#3085d6',
				confirmButtonText: '확인',
			})
			chat_room_input.val(chat_room_input.attr("value"));
			return;
		}
		
		swal.fire({
			text: '채팅방 이름을 수정하시겠습니까?',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: '수정',
			cancelButtonText: '취소',
			
		}).then((result) => {
			if(result.isConfirmed){
				$.ajax(
					{
						type 		: "GET",
						url  		: "chat/room?chatting_room_seq="+div_substr+"&chatting_room_name="+chat_room_input.val(),
						success 	: function(data){
							console.log(data);
						},
						error		: function(request,status,error){
							alert(error);
						}
					}
				);
				//input 태그 삭제
				chat_room_input.remove();
				//div title에 value값 넣기
				let opr = 	"<a id='chat-list-letter-a"+div_substr+"' href='javascript:popupOpen("+div_substr+",\""+chat_room_input.val()+"\");' class='chat-list-letter-a'>"+
								chat_room_input.val()+
							"</a>";
				chat_room_title.append(opr);
				
				swal.fire({
					text: '수정이 완료되었습니다',
					icon: 'success',
					confirmButtonColor: '#3085d6',
					confirmButtonText: '확인',
				})
				
			}else{
				//input 태그 삭제
				chat_room_input.remove();
				//div title에 value값 넣기
				let opr = 	"<a id='chat-list-letter-a"+div_substr+"' href='javascript:popupOpen("+div_substr+",\""+chat_room_input.val()+"\");' class='chat-list-letter-a'>"+
								chat_room_input.attr("value")+
							"</a>";
				chat_room_title.append(opr);
			}
		});
		
	//input 태그에 아무 값도 입력하지 않으면
	}else{
		//input 태그 삭제
		chat_room_input.remove();
		//div title에 value값 넣기
		let opr = 	"<a id='chat-list-letter-a"+div_substr+"' href='javascript:popupOpen("+div_substr+",\""+chat_room_input.attr("value")+"\");' class='chat-list-letter-a'>"+
						chat_room_input.attr("value")+
					"</a>";
		chat_room_title.append(opr);
	}
	
	//버튼 이미지
	$('#chat-list-update-'+div_substr).empty();
	//div 태그에 버튼 이미지 넣기
	let opr = "<i onclick='updateChatRoomName(this)' class='fas fa-pencil-alt'></i>";
	$('#chat-list-update-'+div_substr).append(opr);
	
}


/*
파일명: projectMainChat.js
설명: 채팅방 생성시 유저리스트를 DB에서 갖고옵니다
작성일: 2020-12-30
작성자: 도재구
*/
function userList(data){
	"use strict";
	$('#Chatting-UserList').empty();
	let opr = "";
	$.each(data,function(index,user){
		opr += "<div id='crtChat-select-users-wrapper-"+index+"' class='crtChat-select-users-wrapper'>"+
					"<div class='crtChat-select-user-wrapper'>"+
						"<div class='crtChat-select-user-subWrapper'>"+
							"<div id='crtChat-select-user-on-"+index+"' class='crtChat-select-user-on'></div>"+
							"<div class='crtChat-select-user-pic'>"+
								"<i class='fas fa-user'></i>"+					
							"</div>"+
							"<div class='crtChat-select-user-letters-wrapper'>"+
								"<div id='crtChat-select-user-name-"+index+"' class='crtChat-select-user-name'>"+
									user.nickName+
								"</div>"+
								"<div id='crtChat-select-user-email-"+index+"' class='crtChat-select-user-email'>"+
									user.email+
								"</div>"+
							"</div>"+
						"</div>"+
						"<div id='crtChat-select-user-btn-"+index+"' class='crtChat-select-user-btn'>"+
							"<i onclick='selectUser(this)' class='fas fa-plus'></i>"+
						"</div>"+
					"</div>"+
				"</div>";
	});
	$('#Chatting-UserList').append(opr);
};

/*
파일명: projectMainChat.js
설명: 유저리스트 중에서 + 버튼을 눌렀을 때 실행되는 함수
작성일: 2020-12-30
작성자: 도재구
*/
function selectUser(me){
	"use strict";
	//버튼을 누른 대상 USER의 index값 추출 'div_substr'
	let div = $(me).closest('div');
	let div_index = div.attr("id").lastIndexOf("-")+1;
	let div_substr = div.attr("id").substring(div_index);

	//버튼을 누른 대상 USER의 이름과 이메일 값 추출
	let nick_name = $('#crtChat-select-user-name-'+div_substr).html();
	let email = $('#crtChat-select-user-email-'+div_substr).html();
	
	$('#crtChat-select-users-wrapper-'+div_substr).remove();
	$('.crtChat-btn-created-not').attr('class','crtChat-btn-created');
	
	let div_length = $('#Chatting-UserList').find('div').length;
	console.log(div_length);
	let select_user_array = [];
	for(let i=1; i <= div_length / 9; i++){
		let j = i * 9 - 2;
		let div = $('#Chatting-UserList').find('div:eq('+j+')').text();
		if(email != div){
			select_user_array.push(div);
		}
	}
	
	if($('#Chatting-UserList').html() != ''){
		$.ajax(
			{
				type 		: "POST",
				url  		: "chat/members/select",
				data 		: {
					'select_user_array' : select_user_array
				},
				traditional : true,
				error		: function(request,status,error){
					alert(error);
				},
				success 	: function(data){
					$('#Selected-List').empty();
					//버튼을 누른 대상 USER를 선택리스트에 옮기기
					let opr = "";
					$.each(data,function(index,user){
						opr +=	"<div id='crtChat-selected-user-wrapper-"+index+"' class='crtChat-selected-user-wrapper'>"+
									"<div class='crtChat-selected-user-pic'>"+
										"<i class='fas fa-user'></i>"+	
									"</div>"+
									"<div class='crtChat-selected-user-letter-wrapper'>"+
										"<div id='crtChat-selected-user-letter-name-"+index+"' class='crtChat-selected-user-letter-name'>"+
											user.nickName+
										"</div>"+
										"<div id='crtChat-selected-user-letter-email-"+index+"' class='crtChat-selected-user-letter-email' hidden>"+
											user.email+
										"</div>"+
										"<div id='crtChat-selected-user-letter-x-"+index+"' class='crtChat-selected-user-letter-x'>"+
											"<i onclick='selectedClose(this)' class='fas fa-times'></i>"+
										"</div>"+
									"</div>"+
								"</div>";
					});
					$('#Selected-List').append(opr);
					
					/*$('#Selected-List').css("display","block");
					$('#Selectedlist-Subject').css("display","block");*/
					//+버튼을 눌렀을시 Chatting-UserList에서 해당 유저 비우기
					
				}
			}
		);
		
	}else{
		$.ajax(
			{
				type : "GET",
				url  : "chat/members?sessionEmail="+$('#session_email').val(),
				success : function(data){
					$('#Selected-List').empty();
					//버튼을 누른 대상 USER를 선택리스트에 옮기기
					let opr = "";
					$.each(data,function(index,user){
						opr +=	"<div id='crtChat-selected-user-wrapper-"+index+"' class='crtChat-selected-user-wrapper'>"+
									"<div class='crtChat-selected-user-pic'>"+
										"<i class='fas fa-user'></i>"+	
									"</div>"+
									"<div class='crtChat-selected-user-letter-wrapper'>"+
										"<div id='crtChat-selected-user-letter-name-"+index+"' class='crtChat-selected-user-letter-name'>"+
											user.nickName+
										"</div>"+
										"<div id='crtChat-selected-user-letter-email-"+index+"' class='crtChat-selected-user-letter-email' hidden>"+
											user.email+
										"</div>"+
										"<div id='crtChat-selected-user-letter-x-"+index+"' class='crtChat-selected-user-letter-x'>"+
											"<i onclick='selectedClose(this)' class='fas fa-times'></i>"+
										"</div>"+
									"</div>"+
								"</div>";
					});
					$('#Selected-List').append(opr);
					
					/*$('#Selected-List').css("display","block");
					$('#Selectedlist-Subject').css("display","block");*/
					//+버튼을 눌렀을시 Chatting-UserList에서 해당 유저 비우기
					
					$('#crtChat-select-users-wrapper-'+div_substr).remove();
					$('.crtChat-btn-created-not').attr('class','crtChat-btn-created');
				}
			}
		);
	}

	
}

/*
파일명: projectMainChat.js
설명: 선택된 리스트 중에서 취소 버튼을 눌렀을 때 실행되는 함수
작성일: 2020-12-30
작성자: 도재구
*/
function selectedClose(me){
	"use strict";
	//span 태그의 전체 html 정보
	let div = $(me).closest('div');
	//selected list에서 해당 유저 삭제
	let email = div.prev().html();
	console.log(div.parent('div').parent('div'));
	div.parent('div').parent('div').remove();
	//$('#crtChat-selected-user-wrapper-'+close_substr).remove();

	//selected list에 유저가 아무도 없을 때 display none
	//let close_attr_class = $('.crtChat-selected-user-letter-wrapper').attr("class");
	/*if(close_attr_class === undefined){
		$('#Selected-List').css("display","none");
		$('#Selectedlist-Subject').css("display","none");
	}*/

	//$('#crtChat-select-users-wrapper-'+close_substr).css("display","block");
	
	console.log("email");
	console.log(email);
	
	if($('#Selected-List').html() != ''){
		
		let div_length = $('#Selected-List').find('div').length;
		let user_array = [];
		for(let i=1; i <= div_length / 6; i++){
			let j = i * 6 - 2;
			let div = $('#Selected-List').find('div:eq('+j+')').text();
			if(email != div){
				user_array.push(div);
			}
		}
		console.log('user_array');
		console.log(user_array);
		
		//채팅방 취소버튼을 눌렀을 떄 유저리스트에 적용될 데이터 전달
		$.ajax(
			{
				type 		: "POST",
				url  		: "chat/members/search?sessionEmail="+$('#session_email').val(),
				data 		: {
					'nickName' : $('#crtChat-search-box').val(),
					'user_array' : user_array
				},
				traditional : true,
				async		: false,
				success 	: function(data){
					console.log(data);
					userList(data);
				},
				error		: function(request,status,error){
					alert(error);
				}
			}
		);
		
		//채팅방 취소버튼을 눌렀을 떄 '선택된파이원' 리스트에 적용될 데이터 전달
		$.ajax(
			{
				type 		: "GET",
				url  		: "chat/members/close?sessionEmail="+$('#session_email').val(),
				data 		: {
					'nickName' : $('#crtChat-search-box').val(),
					'user_array' : user_array
				},
				traditional : true,
				async		: false,
				success 	: function(data){
					console.log(data);
					selectedUserList(data);
				},
				error		: function(request,status,error){
					alert(error);
				}
			}
		);
		
	//선택된 파이원 리스트에 데이터가 비어있을 때 실행
	}else{
		$.ajax(
			{
				type : "GET",
				url  : "chat/members/search?sessionEmail="+$('#session_email').val(),
				data : { 'nickName' : $('#crtChat-search-box').val()},
				success : function(data){
					userList(data);
				},
				error: function(request,status,error){
					alert(error);
				}
			}
		);
		
	}//if($('#Selected-List').html() != '') end
	
	//'채팅방 생성하기' 버튼 CSS 적용
	if($('#Selected-List').is(':empty')){
		$('.crtChat-btn-created').attr('class','crtChat-btn-created-not');
	}


}

/*
파일명: projectMainChat.js
설명: 선택된 리스트 중에서 취소 버튼을 눌렀을 때 실행되는 함수
작성일: 2021-01-06
작성자: 도재구
*/
function selectedUserList(data){
	"use strict";
	$('#Selected-List').empty();
	let opr = "";
	$.each(data,function(index,user){
		opr +=	"<div class='crtChat-selected-user-wrapper'>"+
					"<div class='crtChat-selected-user-pic'>"+
						"<i class='fas fa-user'></i>"+	
					"</div>"+
					"<div class='crtChat-selected-user-letter-wrapper'>"+
						"<div class='crtChat-selected-user-letter-name'>"+
							user.nickName+
						"</div>"+
						"<div class='crtChat-selected-user-letter-email' hidden>"+
							user.email+
						"</div>"+
						"<div class='crtChat-selected-user-letter-x'>"+
							"<i onclick='selectedClose(this)' class='fas fa-times'></i>"+
						"</div>"+
					"</div>"+
				"</div>";
	});
	$('#Selected-List').append(opr);
};
/*//right sidebar contents wrapper*/