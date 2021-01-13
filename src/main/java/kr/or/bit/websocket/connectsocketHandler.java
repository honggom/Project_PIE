package kr.or.bit.websocket;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.ObjectMapper;

public class connectsocketHandler extends TextWebSocketHandler{
	
	//로그인한 전체 회원 관리
	List<String> sessionList = new ArrayList<>();
	// 1대1
	Map<String, WebSocketSession> userSessionsMap = new HashMap<>();
	ObjectMapper objectMapper = new ObjectMapper();
	
	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		System.out.println("connect_afterConnectionEstablished: "+session);
		String loginuser = getLoginUser(session);
		//기존에 존재한 회원인지에 대한 유무 검증,
		if(!userSessionsMap.containsKey(loginuser)) {
			//새로운 회원이면 Map에 넣는다
			userSessionsMap.put(loginuser, session);
			sessionList.add(loginuser);
		}
		/*
		String json = objectMapper.writeValueAsString(sessionList);
		for(Map.Entry m : userSessionsMap.entrySet()) {
			WebSocketSession sess = (WebSocketSession) m.getValue(); 
			sess.sendMessage(new TextMessage(json));
		}
		*/
	}

	@Override
	public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
		System.out.println("connectSocket.send()");
		String json = objectMapper.writeValueAsString(sessionList);
		for(Map.Entry m : userSessionsMap.entrySet()) {
			WebSocketSession sess = (WebSocketSession) m.getValue(); 
			sess.sendMessage(message);
		}
	}
	
	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws IOException  {
		String loginuser = getLoginUser(session);
		sessionList.remove(loginuser);
		userSessionsMap.remove(loginuser);
		/*
		String json = objectMapper.writeValueAsString(sessionList);
		for(Map.Entry m : userSessionsMap.entrySet()) {
			WebSocketSession sess = (WebSocketSession) m.getValue(); 
			sess.sendMessage(new TextMessage(json));
		}
		*/
	}

	public String getLoginUser(WebSocketSession session) {
		Map<String, Object> map = session.getAttributes();
		return (String) map.get("loginuser");
		
	}
}
